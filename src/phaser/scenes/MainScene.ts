
import Phaser from 'phaser';
import { PlayerManager } from '../managers/PlayerManager';
import { CharacterManager } from '../managers/CharacterManager';
import { DialogManager } from '../managers/DialogManager';
import { AssetLoadManager } from '../managers/AssetLoadManager';
import { SpriteLoader } from '../managers/SpriteLoader';
import { assetManager } from '../../utils/assetManager';
import { Character } from '../../types';

export class MainScene extends Phaser.Scene {
  private playerManager: PlayerManager | null = null;
  private characterManager: CharacterManager | null = null;
  private dialogManager: DialogManager | null = null;
  private assetLoadManager: AssetLoadManager | null = null;
  private spriteLoader: SpriteLoader | null = null;
  private characters: Character[] = [];

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    console.log('🔥 MainScene: Préchargement des assets...');
    this.assetLoadManager = new AssetLoadManager(this);
    this.assetLoadManager.preloadAssets();
  }

  create(): void {
    console.log('✅ MainScene: Création de la scène principale...');

    // Initialiser les managers
    this.playerManager = new PlayerManager(this);
    this.characterManager = new CharacterManager(this);
    this.dialogManager = new DialogManager(this);
    this.spriteLoader = new SpriteLoader(this);

    this.setupBackground();
    this.setupCharacters();
    this.setupPlayer();

    // Debug
    (window as any)['scene'] = this;
  }

  private setupBackground(): void {
    console.log('🖼️ MainScene: Configuration du background...');
    
    const backgroundUrl = assetManager.getBackgroundUrl();
    if (backgroundUrl) {
      const backgroundKey = 'main_background';
      
      this.spriteLoader!.loadSpriteAsync(backgroundKey, backgroundUrl).then((loaded) => {
        if (loaded && this.scene.isActive()) {
          console.log('✅ MainScene: Background chargé, ajout à la scène');
          const bg = this.add.image(400, 300, backgroundKey);
          bg.setDepth(-1);
          bg.setDisplaySize(800, 600);
        }
      }).catch((error) => {
        console.error('💥 MainScene: Erreur chargement background:', error);
        this.createFallbackBackground();
      });
    } else {
      console.warn('⚠️ MainScene: Aucun background trouvé, utilisation du fallback');
      this.createFallbackBackground();
    }
  }

  private createFallbackBackground(): void {
    console.log('🎨 MainScene: Création du background de fallback');
    const bg = this.add.rectangle(0, 0, 800, 600, 0x333333);
    bg.setOrigin(0);
    bg.setDepth(-1);
  }

  private async setupCharacters(): Promise<void> {
    console.log('👥 MainScene: Configuration des personnages...');
    
    if (!this.characters || this.characters.length === 0) {
      console.log('⚠️ MainScene: Aucun personnage à afficher');
      return;
    }

    if (this.characterManager) {
      this.characterManager.setCharacters(this.characters);
      
      // Configurer le handler de clic
      this.characterManager.setCharacterClickHandler((character) => {
        console.log('🖱️ MainScene: Clic sur personnage:', character.name);
        this.dialogManager?.startDialog(character);
      });
    }
  }

  private setupPlayer(): void {
    console.log('🚶 MainScene: Configuration du joueur...');
    
    if (this.playerManager) {
      this.playerManager.createPlayer('player');
      
      // Configurer les données des personnages pour les interactions
      if (this.characterManager) {
        const characterSprites = this.characterManager.getCharacterSprites();
        this.playerManager.setCharactersData(this.characters, characterSprites);
        
        // Configurer le handler de clic
        this.playerManager.setCharacterClickHandler((character) => {
          console.log('🖱️ MainScene: Interaction joueur avec:', character.name);
          this.dialogManager?.startDialog(character);
        });
      }
    }
  }

  // Méthode publique pour définir les personnages depuis l'extérieur
  setCharacters(characters: Character[]): void {
    console.log('📝 MainScene: Mise à jour des personnages:', characters.length);
    this.characters = characters;
    
    if (this.scene.isActive()) {
      this.setupCharacters();
    }
  }

  // Méthode publique pour recharger les assets
  reloadAssets(): void {
    console.log('🔄 MainScene: Rechargement des assets...');
    
    // Recharger le background
    this.setupBackground();
    
    // Recharger les personnages
    if (this.characterManager && this.characters.length > 0) {
      this.characterManager.setCharacters(this.characters);
    }
  }

  // Méthode publique pour définir le handler de clic sur personnage
  setCharacterClickHandler(handler: (character: Character) => void): void {
    console.log('🖱️ MainScene: Configuration du handler de clic');
    
    if (this.characterManager) {
      this.characterManager.setCharacterClickHandler(handler);
    }
    
    if (this.playerManager) {
      this.playerManager.setCharacterClickHandler(handler);
    }
  }

  update(): void {
    if (this.playerManager) {
      this.playerManager.update();
    }
  }

  destroy(): void {
    console.log('🧹 MainScene: Nettoyage des ressources...');
    
    // Nettoyer les managers
    if (this.playerManager) {
      this.playerManager.destroy();
    }
    if (this.characterManager) {
      this.characterManager.destroy();
    }
    if (this.dialogManager) {
      this.dialogManager.destroy();
    }
    if (this.assetLoadManager) {
      this.assetLoadManager.destroy();
    }
    if (this.spriteLoader) {
      this.spriteLoader.destroy();
    }

    // Appeler la méthode destroy de la classe parent
    super.destroy();
  }
}
