
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export class GameManager {
  private game: Phaser.Game | null = null;
  private static instance: GameManager;

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  init(parent: string): Phaser.Game {
    if (this.game) {
      this.game.destroy(true);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent,
      backgroundColor: '#2c3e50',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [MainScene],
    };

    this.game = new Phaser.Game(config);
    return this.game;
  }

  getGame(): Phaser.Game | null {
    return this.game;
  }

  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
}
