
import Phaser from 'phaser';
import { assetManager } from '../../utils/assetManager';

export class AssetLoadManager {
  private scene: Phaser.Scene;
  private assetsLoaded: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preloadAssets(): void {
    console.log('🖼️ AssetLoadManager: Préchargement des assets...');
    this.waitForAssetManager();
  }

  async waitForAssetManager(): Promise<void> {
    console.log('⏳ AssetLoadManager: Attente de l\'AssetManager...');
    
    return new Promise((resolve) => {
      const checkAssetManager = () => {
        if (assetManager.isReady()) {
          console.log('✅ AssetLoadManager: AssetManager prêt, chargement des assets...');
          this.loadGeneratedAssets();
          resolve();
        } else {
          console.log('⏳ AssetLoadManager: AssetManager pas encore prêt, attente...');
          setTimeout(checkAssetManager, 500);
        }
      };
      
      checkAssetManager();
    });
  }

  private loadGeneratedAssets() {
    console.log('🖼️ AssetLoadManager: Chargement des assets générés...');
    
    const allAssets = assetManager.getAllAssets();
    console.log('📦 AssetLoadManager: Assets disponibles:', allAssets);

    if (allAssets.length === 0) {
      console.log('📭 AssetLoadManager: Aucun asset trouvé, utilisation des assets par défaut');
      this.assetsLoaded = true;
      return;
    }

    const backgroundUrl = assetManager.getBackgroundUrl();
    if (backgroundUrl) {
      console.log('🖼️ AssetLoadManager: Chargement arrière-plan personnalisé:', backgroundUrl);
      this.scene.load.image('custom_bg', backgroundUrl);
    }

    const characterAssets = assetManager.getCharacterAssets();
    characterAssets.forEach((url, key) => {
      console.log(`👤 AssetLoadManager: Chargement sprite personnage ${key}:`, url);
      this.scene.load.image(`char_${key}`, url);
    });

    const propAssets = assetManager.getPropAssets();
    propAssets.forEach((url, key) => {
      console.log(`🎯 AssetLoadManager: Chargement prop ${key}:`, url);
      this.scene.load.image(key, url);
    });

    this.scene.load.once('complete', () => {
      this.assetsLoaded = true;
      console.log('✅ AssetLoadManager: Tous les assets sont chargés');
    });
    
    this.scene.load.start();
  }

  isAssetsLoaded(): boolean {
    return this.assetsLoaded;
  }

  reloadAssets() {
    console.log('🔄 AssetLoadManager: Rechargement des assets...');
    this.assetsLoaded = false;
    this.waitForAssetManager();
  }

  destroy(): void {
    console.log('🧹 AssetLoadManager: Nettoyage');
    this.assetsLoaded = false;
  }
}
