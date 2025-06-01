
import Phaser from 'phaser';
import { Character } from '../../types';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private characters: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private charactersData: Character[] = [];
  private onCharacterClick?: (character: Character) => void;

  constructor() {
    super({ key: 'MainScene' });
    this.characters = new Phaser.Physics.Arcade.Group(this);
  }

  preload() {
    // Chargement des assets de base
    this.load.image('player', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#3498db" stroke="#2c3e50" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="#2c3e50"/>
        <circle cx="20" cy="12" r="2" fill="#2c3e50"/>
        <path d="M 10 20 Q 16 24 22 20" stroke="#2c3e50" stroke-width="2" fill="none"/>
      </svg>
    `));

    this.load.image('character', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#e74c3c" stroke="#2c3e50" stroke-width="2"/>
        <circle cx="12" cy="12" r="2" fill="#2c3e50"/>
        <circle cx="20" cy="12" r="2" fill="#2c3e50"/>
        <ellipse cx="16" cy="20" rx="4" ry="2" fill="#2c3e50"/>
      </svg>
    `));

    this.load.image('background', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#34495e"/>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2c3e50" stroke-width="1" opacity="0.3"/>
        </pattern>
        <rect width="800" height="600" fill="url(#grid)"/>
      </svg>
    `));
  }

  create() {
    // Fond
    this.add.image(400, 300, 'background');

    // Joueur
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Contrôles
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Groupes pour les personnages
    this.characters = this.physics.add.group();

    // Interaction avec les personnages
    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (gameObject.name === 'character') {
        const character = this.charactersData.find(c => c.id === gameObject.getData('characterId'));
        if (character && this.onCharacterClick) {
          this.onCharacterClick(character);
        }
      }
    });

    console.log('MainScene initialisée');
  }

  update() {
    // Déplacement du joueur
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  setCharacters(characters: Character[]) {
    this.charactersData = characters;
    
    // Supprime les anciens personnages
    this.characters.clear(true, true);

    // Ajoute les nouveaux personnages
    characters.forEach(character => {
      const sprite = this.physics.add.sprite(character.position.x, character.position.y, 'character');
      sprite.setInteractive();
      sprite.name = 'character';
      sprite.setData('characterId', character.id);
      
      // Texte nom au-dessus
      const nameText = this.add.text(character.position.x, character.position.y - 25, character.name, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      nameText.setOrigin(0.5);

      this.characters.add(sprite);
    });
  }

  setCharacterClickHandler(handler: (character: Character) => void) {
    this.onCharacterClick = handler;
  }

  getPlayerPosition() {
    return {
      x: this.player.x,
      y: this.player.y,
    };
  }
}
