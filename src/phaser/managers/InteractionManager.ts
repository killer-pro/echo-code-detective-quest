
import Phaser from 'phaser';
import { Character } from '../../types';

export class InteractionManager {
  private scene: Phaser.Scene;
  private characters: Character[] = [];
  private characterSprites: Phaser.GameObjects.Container[] = [];
  private characterClickHandler: ((character: Character) => void) | null = null;
  private playerPosition: { x: number; y: number } = { x: 400, y: 500 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboardInteraction();
  }

  private setupKeyboardInteraction(): void {
    this.scene.input.keyboard?.on('keydown-SPACE', () => {
      console.log('🎮 InteractionManager: Touche ESPACE pressée');
      this.checkCharacterInteraction();
    });
  }

  setCharactersData(characters: Character[], sprites: Phaser.GameObjects.Container[]): void {
    this.characters = characters;
    this.characterSprites = sprites;
    console.log(`🎮 InteractionManager: ${characters.length} personnages et ${sprites.length} sprites configurés`);
  }

  setCharacterClickHandler(handler: (character: Character) => void): void {
    this.characterClickHandler = handler;
    console.log('🎮 InteractionManager: Handler de clic configuré');
  }

  updatePlayerPosition(position: { x: number; y: number }): void {
    this.playerPosition = position;
  }

  handleCharacterClick(character: Character): void {
    console.log(`🖱️ InteractionManager: Clic sur personnage: ${character.name}`);
    if (this.characterClickHandler) {
      this.characterClickHandler(character);
    } else {
      console.warn('⚠️ InteractionManager: Aucun handler de clic défini');
    }
  }

  private checkCharacterInteraction(): void {
    if (!this.characterClickHandler) {
      console.warn('⚠️ InteractionManager: Aucun handler de clic défini pour l\'interaction');
      return;
    }

    const interactionDistance = 80;
    console.log(`🎮 InteractionManager: Vérification interactions (distance max: ${interactionDistance})`);
    console.log(`🎮 InteractionManager: Position joueur: (${this.playerPosition.x}, ${this.playerPosition.y})`);

    for (let i = 0; i < this.characters.length; i++) {
      const character = this.characters[i];
      const distance = Phaser.Math.Distance.Between(
        this.playerPosition.x, this.playerPosition.y,
        character.position.x, character.position.y
      );

      console.log(`🎮 InteractionManager: Distance avec ${character.name}: ${distance.toFixed(2)}`);

      if (distance < interactionDistance) {
        console.log(`✅ InteractionManager: Interaction possible avec ${character.name}`);
        this.characterClickHandler(character);
        return;
      }
    }

    console.log('❌ InteractionManager: Aucun personnage à portée d\'interaction');
  }

  handlePointerClick(pointer: Phaser.Input.Pointer): void {
    const clickedObjects = this.scene.input.hitTestPointer(pointer);
    
    for (const obj of clickedObjects) {
      const character = obj.getData('character');
      if (character) {
        console.log(`🖱️ InteractionManager: Clic détecté sur personnage: ${character.name}`);
        this.handleCharacterClick(character);
        return;
      }
    }
  }

  destroy(): void {
    this.characters = [];
    this.characterSprites = [];
    this.characterClickHandler = null;
  }
}
