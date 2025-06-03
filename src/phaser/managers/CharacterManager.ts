
import Phaser from 'phaser';
import { Character } from '../../types';
import { assetManager } from '../../utils/assetManager';
import { SpriteLoader } from './SpriteLoader';

export class CharacterManager {
  private scene: Phaser.Scene;
  private characters: Character[] = [];
  private characterSprites: Phaser.GameObjects.Container[] = [];
  private spriteLoader: SpriteLoader;
  private characterClickHandler: ((character: Character) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spriteLoader = new SpriteLoader(scene);
  }

  setCharacters(characters: Character[]) {
    console.log('👥 CharacterManager: Mise à jour des personnages:', characters.length, 'personnages');
    this.characters = characters;
    this.updateCharacterSpritesAsync();
  }

  getCharactersData(): Character[] {
    return this.characters;
  }
  
  destroy() {
    this.characterSprites.forEach(sprite => sprite.destroy());
    this.characterSprites = [];
    this.spriteLoader.destroy();
  }
  
  setCharacterClickHandler(handler: (character: Character) => void) {
    console.log('🖱️ CharacterManager: Handler de clic personnage défini');
    this.characterClickHandler = handler;
  }

  async updateCharacterSpritesAsync() {
    console.log('🎨 CharacterManager: Mise à jour async des sprites de personnages...');
    
    // Nettoyer les sprites existants
    this.characterSprites.forEach(container => container.destroy());
    this.characterSprites = [];

    // Créer les sprites avec chargement asynchrone
    for (const character of this.characters) {
      await this.createCharacterSpriteAsync(character);
    }

    console.log(`✅ CharacterManager: ${this.characterSprites.length} personnages créés`);
  }

  private async createCharacterSpriteAsync(character: Character) {
    console.log(`👤 CharacterManager: Création async du sprite pour ${character.name}`);
    
    const container = this.scene.add.container(character.position.x, character.position.y);
    
    // Essayer de charger le sprite personnalisé
    const sprite = await this.loadCharacterSprite(character);
    container.add(sprite);

    // Configuration du container
    container.setSize(60, 80);
    container.setInteractive();
    container.setData('character', character);

    // Event handlers
    container.on('pointerdown', () => {
      if (this.characterClickHandler) {
        console.log(`🖱️ CharacterManager: Clic sur ${character.name}`);
        this.characterClickHandler(character);
      }
    });

    // Animations
    this.addHoverAnimations(container, sprite);

    // Labels
    this.addCharacterLabels(container, character);

    this.characterSprites.push(container);
    console.log(`✅ CharacterManager: Sprite créé pour ${character.name}`);
  }

  private async loadCharacterSprite(character: Character): Promise<Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle> {
    const characterAssetUrl = assetManager.getCharacterAssetByName(character.name);
    
    if (characterAssetUrl) {
      const normalizedName = character.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
      const spriteKey = `char_${normalizedName}`;
      
      console.log(`🎨 CharacterManager: Tentative de chargement async: ${spriteKey}`);
      
      // Charger le sprite de manière asynchrone
      const loaded = await this.spriteLoader.loadSpriteAsync(spriteKey, characterAssetUrl);
      
      if (loaded) {
        console.log(`✅ CharacterManager: Sprite chargé avec succès: ${spriteKey}`);
        const sprite = this.scene.add.sprite(0, 0, spriteKey);
        sprite.setDisplaySize(60, 80);
        return sprite;
      }
    }

    // Fallback vers sprite par défaut
    console.log(`🎨 CharacterManager: Utilisation du sprite par défaut pour ${character.name}`);
    return this.createDefaultSprite(character);
  }

  private createDefaultSprite(character: Character): Phaser.GameObjects.Rectangle {
    const colors = {
      'témoin': 0x2ecc71,
      'suspect': 0xe74c3c,
      'enquêteur': 0x3498db,
      'innocent': 0x95a5a6
    };
    
    const color = colors[character.role] || 0x95a5a6;
    const sprite = this.scene.add.rectangle(0, 0, 40, 60, color);
    sprite.setStrokeStyle(2, 0xffffff);
    return sprite;
  }

  private addHoverAnimations(container: Phaser.GameObjects.Container, sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle) {
    container.on('pointerover', () => {
      if ('setTint' in sprite) {
        sprite.setTint(0xffff00);
      }
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });

    container.on('pointerout', () => {
      if ('clearTint' in sprite) {
        sprite.clearTint();
      }
      this.scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });
  }

  private addCharacterLabels(container: Phaser.GameObjects.Container, character: Character) {
    // Nom du personnage
    const nameText = this.scene.add.text(
      0, -50,
      character.name,
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      }
    );
    nameText.setOrigin(0.5);
    container.add(nameText);

    // Badge de rôle
    const roleColors = {
      'témoin': '#2ecc71',
      'suspect': '#e74c3c',
      'enquêteur': '#3498db',
      'innocent': '#95a5a6'
    };
    
    const roleText = this.scene.add.text(
      0, 50,
      character.role.toUpperCase(),
      {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: roleColors[character.role] || '#95a5a6',
        padding: { x: 4, y: 2 }
      }
    );
    roleText.setOrigin(0.5);
    container.add(roleText);
  }

  updateCharacterSprites() {
    console.log('🔄 CharacterManager: Déclenchement de la mise à jour async des sprites');
    this.updateCharacterSpritesAsync();
  }

  handleClick(pointer: Phaser.Input.Pointer) {
    const clickedObjects = this.scene.input.hitTestPointer(pointer);
    
    for (const obj of clickedObjects) {
      const character = obj.getData('character');
      if (character && this.characterClickHandler) {
        console.log(`🖱️ CharacterManager: Clic sur personnage: ${character.name}`);
        this.characterClickHandler(character);
        break;
      }
    }
  }

  getCharacterSprites(): Phaser.GameObjects.Container[] {
    return this.characterSprites;
  }
}
