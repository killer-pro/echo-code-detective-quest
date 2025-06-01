
import Phaser from 'phaser';
import { Character } from '../../types';
import { assetManager } from '../../utils/assetManager';

export class MainScene extends Phaser.Scene {
  private characters: Character[] = [];
  private characterSprites: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle)[] = [];
  private player: Phaser.GameObjects.Rectangle | null = null;
  private background: Phaser.GameObjects.Image | null = null;
  private characterClickHandler: ((character: Character) => void) | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private proximityIndicators: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    console.log('MainScene: Chargement des assets...');
    
    // Créer des sprites par défaut simples
    this.load.image('default_bg', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMmMzZTUwIi8+CjxyZWN0IHg9IjEwMCIgeT0iNTAwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDk1ZSIvPgo8Y2lyY2xlIGN4PSI2NTAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSIjZjM5YzEyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmaWxsPSIjZWNmMGYxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1hbm9pciBNeXN0w6lyaWV1eDwvdGV4dD4KPC9zdmc+');
    
    // Charger les assets téléchargés s'ils existent
    const backgrounds = assetManager.getBackgrounds();
    if (backgrounds.length > 0) {
      this.load.image('custom_bg', backgrounds[0]);
    }

    const characterSprites = assetManager.getCharacterSprites();
    characterSprites.forEach((url, index) => {
      this.load.image(`character_${index}`, url);
    });

    // Props
    const props = assetManager.getProps();
    props.forEach((url, index) => {
      this.load.image(`prop_${index}`, url);
    });
  }

  create() {
    console.log('MainScene initialisée');
    
    // Arrière-plan
    const bgKey = this.textures.exists('custom_bg') ? 'custom_bg' : 'default_bg';
    this.background = this.add.image(400, 300, bgKey);
    this.background.setDisplaySize(800, 600);

    // Joueur (carré bleu simple pour l'instant)
    this.player = this.add.rectangle(400, 300, 20, 20, 0x3498db);
    this.player.setInteractive();

    // Contrôles clavier
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    // Créer les personnages si disponibles
    this.updateCharacterSprites();

    // Gestion des clics
    this.input.on('pointerdown', this.handleClick, this);
  }

  update() {
    // Mouvement du joueur avec les flèches
    if (this.cursors && this.player) {
      const speed = 150;
      const deltaTime = this.game.loop.delta / 1000;

      if (this.cursors.left?.isDown) {
        this.player.x -= speed * deltaTime;
      } else if (this.cursors.right?.isDown) {
        this.player.x += speed * deltaTime;
      }

      if (this.cursors.up?.isDown) {
        this.player.y -= speed * deltaTime;
      } else if (this.cursors.down?.isDown) {
        this.player.y += speed * deltaTime;
      }

      // Garder le joueur dans les limites
      this.player.x = Phaser.Math.Clamp(this.player.x, 10, 790);
      this.player.y = Phaser.Math.Clamp(this.player.y, 10, 590);

      // Vérifier la proximité avec les personnages
      this.checkProximity();
    }
  }

  private checkProximity() {
    if (!this.player) return;

    this.characters.forEach((character, index) => {
      const sprite = this.characterSprites[index];
      if (!sprite) return;

      const distance = Phaser.Math.Distance.Between(
        this.player!.x, this.player!.y,
        sprite.x, sprite.y
      );

      const isClose = distance < 80;
      const indicatorKey = `proximity_${character.id}`;

      if (isClose && !this.proximityIndicators.has(indicatorKey)) {
        // Afficher indicateur de proximité
        const indicator = this.add.text(
          sprite.x, sprite.y - 50,
          'Appuyez sur ESPACE pour parler',
          {
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 4, y: 2 }
          }
        );
        indicator.setOrigin(0.5);
        this.proximityIndicators.set(indicatorKey, indicator);

        // Gestion de la touche espace
        this.input.keyboard?.once('keydown-SPACE', () => {
          if (this.characterClickHandler) {
            this.characterClickHandler(character);
          }
        });
      } else if (!isClose && this.proximityIndicators.has(indicatorKey)) {
        // Supprimer l'indicateur
        const indicator = this.proximityIndicators.get(indicatorKey);
        if (indicator) {
          indicator.destroy();
          this.proximityIndicators.delete(indicatorKey);
        }
      }
    });
  }

  setCharacters(characters: Character[]) {
    console.log('Mise à jour des personnages:', characters);
    this.characters = characters;
    this.updateCharacterSprites();
  }

  setCharacterClickHandler(handler: (character: Character) => void) {
    this.characterClickHandler = handler;
  }

  private updateCharacterSprites() {
    // Nettoyer les sprites existants
    this.characterSprites.forEach(sprite => sprite.destroy());
    this.characterSprites = [];
    this.proximityIndicators.forEach(indicator => indicator.destroy());
    this.proximityIndicators.clear();

    // Créer les nouveaux sprites
    this.characters.forEach((character, index) => {
      // Utiliser un sprite personnalisé s'il existe, sinon un rectangle coloré
      let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
      
      const customSpriteKey = `character_${index}`;
      if (this.textures.exists(customSpriteKey)) {
        sprite = this.add.sprite(character.position.x, character.position.y, customSpriteKey);
        sprite.setDisplaySize(40, 60);
      } else {
        // Sprite par défaut basé sur le rôle
        const colors = {
          'témoin': 0x2ecc71,
          'suspect': 0xe74c3c,
          'enquêteur': 0x3498db,
          'innocent': 0x95a5a6
        };
        
        const color = colors[character.role] || 0x95a5a6;
        sprite = this.add.rectangle(character.position.x, character.position.y, 30, 40, color);
      }

      // Rendre interactif
      sprite.setInteractive();
      sprite.setData('character', character);

      // Animation de hover avec vérification de type
      sprite.on('pointerover', () => {
        if ('setTint' in sprite) {
          sprite.setTint(0xffff00);
        }
        this.tweens.add({
          targets: sprite,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          ease: 'Power2'
        });
      });

      sprite.on('pointerout', () => {
        if ('clearTint' in sprite) {
          sprite.clearTint();
        }
        this.tweens.add({
          targets: sprite,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2'
        });
      });

      // Nom du personnage
      const nameText = this.add.text(
        character.position.x,
        character.position.y - 30,
        character.name,
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 }
        }
      );
      nameText.setOrigin(0.5);

      // Badge de rôle
      const roleColors = {
        'témoin': '#2ecc71',
        'suspect': '#e74c3c',
        'enquêteur': '#3498db',
        'innocent': '#95a5a6'
      };
      
      const roleText = this.add.text(
        character.position.x,
        character.position.y + 30,
        character.role,
        {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: roleColors[character.role] || '#95a5a6',
          padding: { x: 3, y: 1 }
        }
      );
      roleText.setOrigin(0.5);

      this.characterSprites.push(sprite);
    });
  }

  private handleClick(pointer: Phaser.Input.Pointer) {
    // Vérifier si on a cliqué sur un personnage
    const clickedObjects = this.input.hitTestPointer(pointer);
    
    for (const obj of clickedObjects) {
      const character = obj.getData('character');
      if (character && this.characterClickHandler) {
        this.characterClickHandler(character);
        break;
      }
    }
  }

  // Méthodes pour ajouter des effets visuels
  addInvestigationEffect(x: number, y: number) {
    const particles = this.add.particles(x, y, 'default_bg', {
      scale: { start: 0.3, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 600,
      quantity: 5
    });

    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  highlightCharacter(characterId: string) {
    const characterSprite = this.characterSprites.find(sprite => {
      const char = sprite.getData('character');
      return char && char.id === characterId;
    });

    if (characterSprite) {
      this.tweens.add({
        targets: characterSprite,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: 2
      });
    }
  }
}
