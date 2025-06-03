
import Phaser from 'phaser';
import { Asset } from '../../types';

export class SpriteLoader {
  private scene: Phaser.Scene;
  private loadingPromises: Map<string, Promise<void>> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async loadSpriteAsync(key: string, url: string): Promise<boolean> {
    console.log(`🎨 SpriteLoader: Chargement async du sprite ${key}`);

    // Vérifier si le sprite est déjà chargé
    if (this.scene.textures.exists(key)) {
      console.log(`✅ SpriteLoader: Sprite ${key} déjà chargé`);
      return true;
    }

    // Vérifier si le chargement est déjà en cours
    if (this.loadingPromises.has(key)) {
      console.log(`⏳ SpriteLoader: Attente du chargement en cours pour ${key}`);
      await this.loadingPromises.get(key);
      return this.scene.textures.exists(key);
    }

    // Créer une nouvelle promesse de chargement
    const loadingPromise = new Promise<void>((resolve, reject) => {
      this.scene.load.image(key, url);
      
      const onComplete = () => {
        this.scene.load.off('complete', onComplete);
        this.scene.load.off('filecomplete', onFileComplete);
        this.loadingPromises.delete(key);
        console.log(`✅ SpriteLoader: Sprite ${key} chargé avec succès`);
        resolve();
      };

      const onFileComplete = (fileKey: string) => {
        if (fileKey === key) {
          this.scene.load.off('complete', onComplete);
          this.scene.load.off('filecomplete', onFileComplete);
          this.loadingPromises.delete(key);
          console.log(`✅ SpriteLoader: Fichier ${key} chargé avec succès`);
          resolve();
        }
      };

      this.scene.load.once('complete', onComplete);
      this.scene.load.on('filecomplete', onFileComplete);
      
      this.scene.load.start();
    });

    this.loadingPromises.set(key, loadingPromise);
    
    try {
      await loadingPromise;
      return this.scene.textures.exists(key);
    } catch (error) {
      console.error(`💥 SpriteLoader: Erreur lors du chargement de ${key}:`, error);
      this.loadingPromises.delete(key);
      return false;
    }
  }

  async loadMultipleSprites(assets: Asset[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    console.log(`🎨 SpriteLoader: Chargement de ${assets.length} sprites`);
    
    const loadPromises = assets.map(async (asset) => {
      const key = this.generateSpriteKey(asset);
      const success = await this.loadSpriteAsync(key, asset.url);
      results.set(key, success);
      return { key, success };
    });

    await Promise.all(loadPromises);
    console.log(`✅ SpriteLoader: Chargement terminé, ${results.size} sprites traités`);
    
    return results;
  }

  private generateSpriteKey(asset: Asset): string {
    if (asset.type === 'character' && asset.characterId) {
      return `char_${asset.characterId.toLowerCase().replace(/[^\w]/g, '_')}`;
    }
    if (asset.type === 'background') {
      return 'custom_bg';
    }
    return asset.name.toLowerCase().replace(/[^\w]/g, '_');
  }

  isLoaded(key: string): boolean {
    return this.scene.textures.exists(key);
  }

  destroy(): void {
    this.loadingPromises.clear();
  }
}
