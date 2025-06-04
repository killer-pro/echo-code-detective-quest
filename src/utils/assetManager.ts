
import { Investigation, Character, Asset } from '../types';

class AssetManager {
  private currentInvestigation: string | null = null;
  private assets: Map<string, string> = new Map();
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
      console.log('🖼️ Arrière-plan principal chargé');
    }

    // Charger l'image du joueur si disponible
    if (investigation.player_image_url) {
      this.assets.set('player_image', investigation.player_image_url);
      console.log('👤 Image du joueur chargée');
    }

    // Charger les assets des personnages
    investigation.characters.forEach(character => {
      if (character.image_url) {
        this.assets.set(`character_${character.id}`, character.image_url);
        console.log(`👤 Image de ${character.name} chargée`);
      }
      
      if (character.dialogue_background_url) {
        this.assets.set(`dialogue_bg_${character.id}`, character.dialogue_background_url);
        console.log(`🎭 Arrière-plan dialogue de ${character.name} chargé`);
      }
    });

    console.log(`✅ ${this.assets.size} assets chargés depuis l'investigation`);
    this.markAsReady();
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
    return this.getAssetUrl('background_main');
  }

  getPlayerImage(): string | null {
    return this.getAssetUrl('player_image');
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
    this.isReady = false;
  }
}

export const assetManager = new AssetManager();
