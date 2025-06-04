import { Investigation, Character, Asset } from '../types';

interface LocalAsset {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
  characterId?: string;
}

class AssetManager {
  private currentInvestigation: string | null = null;
  private assets: Map<string, string> = new Map();
  private localAssets: Map<string, LocalAsset> = new Map();
  private isReady = false;

  setCurrentInvestigation(investigationId: string) {
    console.log('🎮 AssetManager: Investigation définie:', investigationId);
    this.currentInvestigation = investigationId;
    this.isReady = false;
  }

  async loadAssetsFromDatabase() {
    if (!this.currentInvestigation) {
      console.warn('⚠️ AssetManager: Aucune investigation définie');
      return;
    }

    console.log('🔄 AssetManager: Chargement des assets depuis la BD...');
    this.assets.clear();

    // Les assets sont maintenant stockés directement dans les tables
    // Pas besoin de charger depuis cloudinary_assets
    console.log('✅ AssetManager: Assets chargés depuis les URLs directes dans les tables');
    this.markAsReady();
  }

  async initializeDemoAssets() {
    console.log('🎮 AssetManager: Initialisation des assets démo...');
    this.assets.clear();
    
    // Pour la démo, les assets sont déjà dans les données
    this.markAsReady();
  }

  loadAssetsFromInvestigation(investigation: Investigation) {
    console.log('📁 AssetManager: Chargement assets depuis investigation:', investigation.title);
    this.assets.clear();

    // Charger l'arrière-plan de l'investigation
    if (investigation.background_url) {
      this.assets.set('background_main', investigation.background_url);
      this.assets.set('background', investigation.background_url); // Alias pour compatibilité
      console.log('🖼️ Arrière-plan principal chargé');
    }

    // Charger l'image du joueur si disponible
    if (investigation.player_image_url) {
      this.assets.set('player_image', investigation.player_image_url);
      this.assets.set('player', investigation.player_image_url); // Alias pour compatibilité
      console.log('👤 Image du joueur chargée');
    }

    // Charger les assets des personnages
    investigation.characters.forEach(character => {
      if (character.image_url) {
        this.assets.set(`character_${character.id}`, character.image_url);
        this.assets.set(character.name, character.image_url); // Alias par nom pour compatibilité
        console.log(`👤 Image de ${character.name} chargée`);
      }
      
      if (character.dialogue_background_url) {
        this.assets.set(`dialogue_bg_${character.id}`, character.dialogue_background_url);
        console.log(`🎭 Arrière-plan dialogue de ${character.name} chargé`);
      }
    });

    // Charger les assets des indices si disponibles
    if (investigation.clues) {
      investigation.clues.forEach(clue => {
        if (clue.image_url) {
          this.assets.set(`clue_${clue.id}`, clue.image_url);
          console.log(`🔍 Image de l'indice ${clue.name} chargée`);
        }
      });
    }

    console.log(`✅ ${this.assets.size} assets chargés depuis l'investigation`);
    this.markAsReady();
  }

  registerLocalAsset(asset: LocalAsset) {
    console.log(`📝 AssetManager: Enregistrement asset local: ${asset.name}`);
    this.localAssets.set(asset.name, asset);
    this.assets.set(asset.name, asset.url);
    
    // Ajouter des alias pour compatibilité
    if (asset.type === 'character' && asset.characterId) {
      this.assets.set(asset.characterId, asset.url);
    }
  }

  markAsReadyForLocalAssets() {
    console.log('✅ AssetManager: Marqué comme prêt pour les assets locaux');
    this.markAsReady();
  }

  getAsset(assetName: string): { url: string } | null {
    const url = this.assets.get(assetName);
    return url ? { url } : null;
  }

  getAssetUrl(assetName: string): string | null {
    return this.assets.get(assetName) || null;
  }

  getCharacterImage(characterId: string): string | null {
    return this.getAssetUrl(`character_${characterId}`);
  }

  getCharacterDialogueBackground(characterId: string): string | null {
    return this.getAssetUrl(`dialogue_bg_${characterId}`);
  }

  getBackgroundImage(): string | null {
    return this.getAssetUrl('background_main') || this.getAssetUrl('background');
  }

  getPlayerImage(): string | null {
    return this.getAssetUrl('player_image') || this.getAssetUrl('player');
  }

  getClueImage(clueId: string): string | null {
    return this.getAssetUrl(`clue_${clueId}`);
  }

  markAsReady() {
    this.isReady = true;
    console.log('✅ AssetManager: Prêt avec', this.assets.size, 'assets');
  }

  isAssetManagerReady(): boolean {
    return this.isReady;
  }

  getCurrentInvestigation(): string | null {
    return this.currentInvestigation;
  }

  getAllAssets(): Map<string, string> {
    return new Map(this.assets);
  }

  reset() {
    console.log('🔄 AssetManager: Reset');
    this.currentInvestigation = null;
    this.assets.clear();
    this.localAssets.clear();
    this.isReady = false;
  }
}

export const assetManager = new AssetManager();
