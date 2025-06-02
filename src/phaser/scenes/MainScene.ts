
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
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private nearbyCharacter: Character | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    console.log('MainScene: Chargement des assets...');
    
    // Créer des sprites par défaut
    this.load.image('default_bg', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMmMzZTUwIi8+CjxyZWN0IHg9IjEwMCIgeT0iNTAwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDk1ZSIvPgo8Y2lyY2xlIGN4PSI2NTAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSIjZjM5YzEyIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmaWxsPSIjZWNmMGYxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1hbm9pciBNeXN0w6lyaWV1eDwvdGV4dD4KPC9zdmc+');
    
    // Charger les assets générés par l'IA
    this.loadGeneratedAssets();
  }

  private loadGeneratedAssets() {
    console.log('Chargement des assets générés...');
    
    const allAssets = assetManager.getAllAssets();
    console.log('Assets disponibles:', allAssets);

    // Charger l'arrière-plan généré
    const backgroundUrl = assetManager.getBackgroundUrl();
    if (backgroundUrl) {
      console.log('Chargement arrière-plan personnalisé:', backgroundUrl);
      this.load.image('custom_bg', backgroundUrl);
    }

    // Charger les sprites de personnages générés
    const characterAssets = assetManager.getCharacterAssets();
    characterAssets.forEach((url, key) => {
      console.log(`Chargement sprite personnage ${key}:`, url);
      this.load.image(key, url);
    });

    // Charger les props générés
    const propAssets = assetManager.getPropAssets();
    propAssets.forEach((url, key) => {
      console.log(`Chargement prop ${key}:`, url);
      this.load.image(key, url);
    });
  }

  create() {
    console.log('MainScene initialisée avec assets personnalisés');
    
    // Arrière-plan - utiliser l'asset généré ou le défaut
    const bgKey = this.textures.exists('custom_bg') ? 'custom_bg' : 'default_bg';
    this.background = this.add.image(400, 300, bgKey);
    this.background.setDisplaySize(800, 600);
    console.log(`Arrière-plan utilisé: ${bgKey}`);

    // Joueur (cube bleu contrôlable)
    this.player = this.add.rectangle(400, 400, 30, 30, 0x3498db);
    this.player.setStrokeStyle(2, 0x2980b9);

    // Contrôles clavier
    this.cursors = this.input.keyboard?.createCursorKeys() || null;
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) || null;

    // Créer les personnages
    this.updateCharacterSprites();

    // Gestion des clics
    this.input.on('pointerdown', this.handleClick, this);
  }

  update() {
    // Mouvement du joueur avec les flèches
    if (this.cursors && this.player) {
      const speed = 200;
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
      this.player.x = Phaser.Math.Clamp(this.player.x, 15, 785);
      this.player.y = Phaser.Math.Clamp(this.player.y, 15, 585);

      // Vérifier la proximité avec les personnages
      this.checkProximity();
    }

    // Gérer l'interaction avec la touche ESPACE
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.nearbyCharacter && this.characterClickHandler) {
        console.log(`Interaction avec ${this.nearbyCharacter.name} via ESPACE`);
        this.characterClickHandler(this.nearbyCharacter);
      }
    }
  }

  private checkProximity() {
    if (!this.player) return;

    let closestCharacter: Character | null = null;
    let closestDistance = Infinity;

    this.characters.forEach((character, index) => {
      const sprite = this.characterSprites[index];
      if (!sprite) return;

      const distance = Phaser.Math.Distance.Between(
        this.player!.x, this.player!.y,
        sprite.x, sprite.y
      );

      if (distance < 100 && distance < closestDistance) {
        closestCharacter = character;
        closestDistance = distance;
      }

      const indicatorKey = `proximity_${character.id}`;
      const isClose = distance < 100;

      if (isClose && !this.proximityIndicators.has(indicatorKey)) {
        // Afficher indicateur de proximité
        const indicator = this.add.text(
          sprite.x, sprite.y - 80,
          '⚡ ESPACE pour parler',
          {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 6, y: 3 }
          }
        );
        indicator.setOrigin(0.5);
        this.proximityIndicators.set(indicatorKey, indicator);

      } else if (!isClose && this.proximityIndicators.has(indicatorKey)) {
        // Supprimer l'indicateur
        const indicator = this.proximityIndicators.get(indicatorKey);
        if (indicator) {
          indicator.destroy();
          this.proximityIndicators.delete(indicatorKey);
        }
      }
    });

    this.nearbyCharacter = closestCharacter;
  }

  setCharacters(characters: Character[]) {
    console.log('Mise à jour des personnages avec assets:', characters);
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

    // Créer les nouveaux sprites avec assets générés
    this.characters.forEach((character, index) => {
      let sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
      
      // Essayer d'utiliser un sprite personnalisé généré
      const customSpriteKey = `character_${index}`;
      if (this.textures.exists(customSpriteKey)) {
        console.log(`Utilisation sprite personnalisé pour ${character.name}:`, customSpriteKey);
        sprite = this.add.sprite(character.position.x, character.position.y, customSpriteKey);
        sprite.setDisplaySize(60, 80);
      } else {
        // Sprite par défaut basé sur le rôle
        const colors = {
          'témoin': 0x2ecc71,
          'suspect': 0xe74c3c,
          'enquêteur': 0x3498db,
          'innocent': 0x95a5a6
        };
        
        const color = colors[character.role] || 0x95a5a6;
        sprite = this.add.rectangle(character.position.x, character.position.y, 40, 60, color);
        sprite.setStrokeStyle(2, 0xffffff);
        console.log(`Utilisation sprite par défaut pour ${character.name}`);
      }

      // Rendre interactif
      sprite.setInteractive();
      sprite.setData('character', character);

      // Animation de hover
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
        character.position.y - 50,
        character.name,
        {
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 6, y: 3 }
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
        character.position.y + 40,
        character.role.toUpperCase(),
        {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: roleColors[character.role] || '#95a5a6',
          padding: { x: 4, y: 2 }
        }
      );
      roleText.setOrigin(0.5);

      this.characterSprites.push(sprite);
    });

    console.log(`${this.characterSprites.length} personnages créés avec assets`);
  }

  private handleClick(pointer: Phaser.Input.Pointer) {
    const clickedObjects = this.input.hitTestPointer(pointer);
    
    for (const obj of clickedObjects) {
      const character = obj.getData('character');
      if (character && this.characterClickHandler) {
        console.log(`Clic sur personnage: ${character.name}`);
        this.characterClickHandler(character);
        break;
      }
    }
  }

  // Méthode pour recharger les assets après génération
  reloadAssets() {
    console.log('Rechargement des assets...');
    
    // Forcer le rechargement des textures
    const allAssets = assetManager.getAllAssets();
    
    allAssets.forEach((asset, index) => {
      const key = asset.type === 'background' ? 'custom_bg' : 
                  asset.type === 'character' ? `character_${index}` : 
                  `prop_${index}`;
      
      // Supprimer l'ancienne texture si elle existe
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
      
      // Recharger la nouvelle texture
      this.load.image(key, asset.url);
    });
    
    // Démarrer le chargement
    this.load.start();
    
    this.load.once('complete', () => {
      // Mettre à jour l'arrière-plan
      if (this.background && this.textures.exists('custom_bg')) {
        this.background.setTexture('custom_bg');
        console.log('Arrière-plan mis à jour');
      }
      
      // Mettre à jour les personnages
      this.updateCharacterSprites();
      console.log('Assets rechargés et personnages mis à jour');
    });
  }
}
