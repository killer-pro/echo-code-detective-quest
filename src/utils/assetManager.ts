
import { supabase } from '../integrations/supabase/client';
import { generateAssetImage } from './imageGenerator';
import { SVGFallbacks } from './svgFallbacks';
import type { Database } from '../integrations/supabase/types';

type InvestigationRow = Database['public']['Tables']['investigations']['Row'];
type InvestigationAssetRow = Database['public']['Tables']['investigation_assets']['Row'];

interface Asset {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
  characterId?: string;
}

interface AssetPrompt {
  type: string;
  name: string;
  prompt: string;
  style: string;
}

class AssetManager {
  private currentInvestigationId: string | null = null;
  private assets: Map<string, Asset> = new Map();
  private ready: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    console.log('🎨 AssetManager: Initialisation');
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

    console.log('📥 AssetManager: Chargement des assets depuis la base de données...');

    try {
      // 1. Récupérer les assets existants
      const { data: existingAssets, error: assetsError } = await supabase
          .from('investigation_assets')
          .select('*')
          .eq('investigation_id', this.currentInvestigationId);

      if (assetsError) {
        console.error('💥 AssetManager: Erreur chargement assets:', assetsError);
        throw assetsError;
      }

      console.log(`📦 AssetManager: ${existingAssets?.length || 0} assets trouvés en base`);

      // 2. Pour l'instant, on charge simplement les assets existants
      // La logique de génération sera ajoutée plus tard quand on aura la colonne asset_prompts
      if (existingAssets && existingAssets.length > 0) {
        existingAssets.forEach((asset: InvestigationAssetRow) => {
          this.registerAsset({
            name: asset.asset_name,
            url: asset.asset_url,
            type: asset.asset_type as 'background' | 'character' | 'prop',
            characterId: this.extractCharacterIdFromName(asset.asset_name)
          });
        });
      }

      this.ready = true;
      console.log('✅ AssetManager: Chargement terminé, assets prêts');

    } catch (error) {
      console.error('💥 AssetManager: Erreur lors du chargement:', error);
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

  // Ajouter la méthode addAsset manquante
  async addAsset(asset: Asset, prompt?: string): Promise<void> {
    this.registerAsset(asset);
    
    // Sauvegarder en base de données si ce n'est pas la démo
    if (this.currentInvestigationId && this.currentInvestigationId !== 'demo-investigation-001') {
      await this.saveAssetToDatabase(asset.name, asset.url, asset.type);
    }
  }

  private async saveAssetToDatabase(name: string, url: string, type: string): Promise<void> {
    if (!this.currentInvestigationId) return;

    try {
      const { error } = await supabase
          .from('investigation_assets')
          .upsert({
            investigation_id: this.currentInvestigationId,
            asset_name: name,
            asset_url: url,
            asset_type: type,
            created_at: new Date().toISOString()
          });

      if (error) {
        console.error('💥 AssetManager: Erreur sauvegarde asset:', error);
      } else {
        console.log(`💾 AssetManager: Asset sauvegardé en base: ${name}`);
      }
    } catch (error) {
      console.error('💥 AssetManager: Erreur lors de la sauvegarde:', error);
    }
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

  getCharacterAssets(): Map<string, string> {
    const characterAssets = new Map();
    this.assets.forEach((asset, name) => {
      if (asset.type === 'character' && asset.characterId) {
        characterAssets.set(asset.characterId, asset.url);
      }
    });
    return characterAssets;
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

  getPropAssets(): Map<string, string> {
    const propAssets = new Map();
    this.assets.forEach((asset, name) => {
      if (asset.type === 'prop') {
        propAssets.set(name, asset.url);
      }
    });
    return propAssets;
  }

  getAllAssets(): Asset[] {
    return Array.from(this.assets.values());
  }

  private extractCharacterIdFromName(assetName: string): string | undefined {
    const match = assetName.match(/character_(.+)/);
    return match ? match[1] : undefined;
  }

  async preloadAllAssets(): Promise<void> {
    console.log('🎮 AssetManager: Préchargement des assets pour Phaser...');
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
