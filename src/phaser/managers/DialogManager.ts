
import Phaser from 'phaser';
import { Character } from '../../types';

export class DialogManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initializeDialogs(scene: Phaser.Scene): void {
    console.log('💬 DialogManager: Initialisation des dialogues');
  }

  startDialog(character: Character): void {
    console.log(`💬 DialogManager: Démarrage dialogue avec ${character.name}`);
    // La logique de dialogue sera gérée par React
  }

  destroy(): void {
    console.log('🧹 DialogManager: Nettoyage');
  }
}
