
import Phaser from 'phaser';
import { PlayerManager } from '../managers/PlayerManager';
import { CharacterManager } from '../managers/CharacterManager';
import { DialogManager } from '../managers/DialogManager';
import { AssetLoadManager } from '../managers/AssetLoadManager';
import { SpriteLoader } from '../managers/SpriteLoader';
import { assetManager } from '../../utils/assetManager';

export class MainScene extends Phaser.Scene {
  private playerManager: PlayerManager | null = null;
  private characterManager: CharacterManager | null = null;
  private dialogManager: DialogManager | null = null;
  private assetLoadManager: AssetLoadManager | null = null;
  private spriteLoader: SpriteLoader | null = null;

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

    // Charger le background depuis l'AssetManager
    const backgroundKey = 'main_background';
    const backgroundUrl = assetManager.getBackgroundUrl();

    if (backgroundUrl) {
      this.spriteLoader.loadSpriteAsync(backgroundKey, backgroundUrl).then((loaded) => {
        if (loaded) {
          this.add.image(400, 300, backgroundKey).setDepth(-1);
        }
      });
    } else {
      console.warn('⚠️ MainScene: Aucun background trouvé, utilisation du fallback');
      this.add.rectangle(0, 0, 800, 600, 0x333333).setOrigin(0).setDepth(-1);
    }

    // Charger les personnages depuis l'AssetManager
    const characterAssets = assetManager.getCharacterAssets();
    const charactersData = this.characterManager.getCharactersData();

    // Préparer les sprites des personnages
    const characterSprites: Phaser.GameObjects.Container[] = [];

    characterAssets.forEach((url, characterId) => {
      const characterData = charactersData.find(char => char.id === characterId);
      if (characterData) {
        this.spriteLoader!.loadSpriteAsync(`character_${characterId}`, url).then((loaded) => {
          if (loaded) {
            const sprite = this.add.sprite(characterData.position.x, characterData.position.y, `character_${characterId}`);
            sprite.setInteractive();
            sprite.setDisplaySize(40, 60);
            const container = this.add.container(characterData.position.x, characterData.position.y, [sprite]);
            characterSprites.push(container);
          }
        });
      }
    });

    // Créer le joueur
    this.playerManager.createPlayer('player');

    // Configurer les interactions
    this.playerManager.setCharactersData(charactersData, characterSprites);
    this.playerManager.setCharacterClickHandler((character) => {
      this.dialogManager?.startDialog(character);
    });

    // Initialiser les dialogues
    this.dialogManager.initializeDialogs(this);

    // Debug
    (window as any)['scene'] = this;
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
