
import Phaser from 'phaser';
import { Character } from '../../types';
import { InteractionManager } from './InteractionManager';

export class PlayerManager {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.Sprite | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private interactionManager: InteractionManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.interactionManager = new InteractionManager(scene);
  }

  createPlayer(spriteKey: string) {
    console.log('🎮 PlayerManager: Création du joueur...', spriteKey);
    
    if (this.scene.textures.exists(spriteKey)) {
      this.player = this.scene.add.sprite(400, 500, spriteKey);
      console.log('✅ PlayerManager: Joueur créé comme sprite avec texture', spriteKey);
    } else {
      console.warn('⚠️ PlayerManager: Texture non trouvée:', spriteKey, 'utilisation du fallback');
      this.player = this.scene.add.sprite(400, 500, 'default_player');
    }
    
    this.player.setDisplaySize(40, 60);
    this.player.setTint(0x0099ff);
    console.log('🎹 PlayerManager: Contrôles clavier initialisés');
    
    this.cursors = this.scene.input.keyboard?.createCursorKeys() || null;
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.x -= speed * this.scene.game.loop.delta / 1000;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed * this.scene.game.loop.delta / 1000;
    }
    
    if (this.cursors.up.isDown) {
      this.player.y -= speed * this.scene.game.loop.delta / 1000;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed * this.scene.game.loop.delta / 1000;
    }

    // Limiter le joueur aux bords de l'écran
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // Mettre à jour la position pour les interactions
    this.interactionManager.updatePlayerPosition({ x: this.player.x, y: this.player.y });
  }

  setCharactersData(characters: Character[], sprites: Phaser.GameObjects.Container[]) {
    this.interactionManager.setCharactersData(characters, sprites);
  }

  setCharacterClickHandler(handler: (character: Character) => void) {
    this.interactionManager.setCharacterClickHandler(handler);
  }

  getPosition(): { x: number; y: number } {
    if (!this.player) return { x: 400, y: 500 };
    return { x: this.player.x, y: this.player.y };
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.cursors = null;
    this.interactionManager.destroy();
  }
}
