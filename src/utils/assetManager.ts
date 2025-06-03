
import { supabase } from '../integrations/supabase/client';
import { CloudinaryService } from './cloudinaryService';
import { SVGFallbacks } from './svgFallbacks';
import type { Database } from '../integrations/supabase/types';

type InvestigationRow = Database['public']['Tables']['investigations']['Row'];
type CloudinaryAssetRow = Database['public']['Tables']['cloudinary_assets']['Row'];

interface Asset {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop' | 'dialogue_bg' | 'player';
  characterId?: string;
  locationContext?: string;
}

class AssetManager {
  private currentInvestigationId: string | null = null;
  private assets: Map<string, Asset> = new Map();
  private ready: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    console.log('🎨 AssetManager: Initialisation avec support Cloudinary');
  }

  setCurrentInvestigation(investigationId: string) {
    console.log('🎯 AssetManager: Investigation définie:', investigationId);
    this.currentInvestigationId = investigationId;
    this.ready = false;
    this.assets.clear();
  }

  async loadAssetsFromDatabase(): Promise<void> {
    if (!this.currentInvestigationId) {
      console.warn('⚠️ AssetManager: Aucune investigation définie');
      return;
    }

    if (this.loadingPromise) {
      console.log('⏳ AssetManager: Chargement déjà en cours...');
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadAssetsFromDatabase();
    await this.loadingPromise;
    this.loadingPromise = null;
  }

  private async _loadAssetsFromDatabase(): Promise<void> {
    if (!this.currentInvestigationId) return;

    console.log('📥 AssetManager: Chargement des assets Cloudinary...');

    try {
      // 1. Récupérer les assets Cloudinary existants
      const { data: cloudinaryAssets, error: cloudinaryError } = await supabase
        .from('cloudinary_assets')
        .select('*')
        .eq('investigation_id', this.currentInvestigationId);

      if (cloudinaryError) {
        console.error('💥 AssetManager: Erreur chargement assets Cloudinary:', cloudinaryError);
        throw cloudinaryError;
      }

      console.log(`📦 AssetManager: ${cloudinaryAssets?.length || 0} assets Cloudinary trouvés`);

      // 2. Charger les assets existants
      if (cloudinaryAssets && cloudinaryAssets.length > 0) {
        cloudinaryAssets.forEach((asset: CloudinaryAssetRow) => {
          this.registerAsset({
            name: asset.asset_name,
            url: asset.cloudinary_url,
            type: asset.asset_type as Asset['type'],
            characterId: asset.character_id || undefined,
            locationContext: asset.location_context || undefined
          });
        });
      } else {
        // 3. Si pas d'assets, en générer automatiquement
        await this.generateMissingAssets();
      }

      this.ready = true;
      console.log('✅ AssetManager: Assets prêts');

    } catch (error) {
      console.error('💥 AssetManager: Erreur lors du chargement:', error);
      await this.loadFallbackAssets();
    }
  }

  private async generateMissingAssets(): Promise<void> {
    if (!this.currentInvestigationId) return;

    console.log('🎨 AssetManager: Génération automatique des assets manquants...');

    try {
      // Récupérer les données de l'investigation
      const { data: investigation, error } = await supabase
        .from('investigations')
        .select(`
          *,
          characters(*)
        `)
        .eq('id', this.currentInvestigationId)
        .single();

      if (error || !investigation) {
        throw new Error('Investigation introuvable');
      }

      // Générer tous les assets via Cloudinary
      await CloudinaryService.generateInvestigationAssets(this.currentInvestigationId, investigation);

      // Recharger les assets nouvellement créés
      await this._loadAssetsFromDatabase();

    } catch (error) {
      console.error('💥 AssetManager: Erreur génération assets:', error);
      await this.loadFallbackAssets();
    }
  }

  private async loadFallbackAssets(): Promise<void> {
    console.log('🔄 AssetManager: Chargement des assets de fallback...');

    this.registerAsset({
      name: 'default_background',
      url: SVGFallbacks.generateBackgroundSVG('Investigation'),
      type: 'background'
    });

    this.registerAsset({
      name: 'default_character',
      url: SVGFallbacks.generateCharacterSVG('Personnage', 'témoin'),
      type: 'character'
    });

    this.ready = true;
    console.log('✅ AssetManager: Assets de fallback chargés');
  }

  async addAsset(asset: Asset): Promise<void> {
    this.registerAsset(asset);
  }

  public markAsReadyForLocalAssets(): void {
    this.ready = true;
    console.log('🎨 AssetManager: Marqué comme prêt pour assets locaux');
  }

  registerAsset(asset: Asset): void {
    this.assets.set(asset.name, asset);
    console.log(`📝 AssetManager: Asset enregistré: ${asset.name} (${asset.type})`);
  }

  registerLocalAsset(asset: Asset): void {
    this.registerAsset(asset);
  }

  getBackgroundUrl(): string | null {
    const backgrounds = Array.from(this.assets.values()).filter(asset => asset.type === 'background');
    return backgrounds.length > 0 ? backgrounds[0].url : null;
  }

  getPlayerImageUrl(): string | null {
    const playerAssets = Array.from(this.assets.values()).filter(asset => asset.type === 'player');
    return playerAssets.length > 0 ? playerAssets[0].url : null;
  }

  getCharacterAssetByName(characterName: string): string | null {
    console.log(`🔍 AssetManager: Recherche asset pour ${characterName}`);
    
    const normalizedSearchName = characterName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
    console.log(`🔍 AssetManager: Nom normalisé: ${normalizedSearchName}`);
    
    for (const [assetName, asset] of this.assets) {
      if (asset.type === 'character') {
        const normalizedAssetName = assetName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
        console.log(`🔍 AssetManager: Comparaison avec asset: ${assetName} -> ${normalizedAssetName}`);
        
        if (normalizedAssetName.includes(normalizedSearchName) || 
            normalizedSearchName.includes(normalizedAssetName.replace('character_', ''))) {
          console.log(`✅ AssetManager: Asset trouvé pour ${characterName}: ${assetName}`);
          return asset.url;
        }
      }
    }
    
    console.log(`❌ AssetManager: Aucun asset trouvé pour ${characterName}`);
    return null;
  }

  getDialogueBackgroundByCharacterId(characterId: string): string | null {
    for (const [assetName, asset] of this.assets) {
      if (asset.type === 'dialogue_bg' && asset.characterId === characterId) {
        console.log(`✅ AssetManager: Arrière-plan dialogue trouvé pour ${characterId}: ${assetName}`);
        return asset.url;
      }
    }
    
    console.log(`❌ AssetManager: Aucun arrière-plan dialogue trouvé pour ${characterId}`);
    return null;
  }

  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  async preloadAllAssets(): Promise<void> {
    console.log('🎮 AssetManager: Préchargement des assets...');
    if (!this.ready) {
      await this.loadAssetsFromDatabase();
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  reset(): void {
    console.log('🔄 AssetManager: Réinitialisation');
    this.assets.clear();
    this.ready = false;
    this.currentInvestigationId = null;
    this.loadingPromise = null;
  }
}

export const assetManager = new AssetManager();
