
interface AssetData {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
}

export class AssetManager {
  private static instance: AssetManager;
  private assets: Map<string, AssetData> = new Map();
  private loadedUrls: Set<string> = new Set();

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  addAsset(asset: AssetData): void {
    this.assets.set(asset.name, asset);
    console.log(`Asset ajouté: ${asset.name} (${asset.type})`);
  }

  getAsset(name: string): AssetData | null {
    return this.assets.get(name) || null;
  }

  getAssetsByType(type: 'background' | 'character' | 'prop'): AssetData[] {
    return Array.from(this.assets.values()).filter(asset => asset.type === type);
  }

  getAllAssets(): AssetData[] {
    return Array.from(this.assets.values());
  }

  getBackgroundUrl(): string | null {
    const backgrounds = this.getAssetsByType('background');
    return backgrounds.length > 0 ? backgrounds[0].url : null;
  }

  getCharacterAssets(): Map<string, string> {
    const characterMap = new Map<string, string>();
    this.getAssetsByType('character').forEach((asset, index) => {
      characterMap.set(`character_${index}`, asset.url);
    });
    return characterMap;
  }

  getPropAssets(): Map<string, string> {
    const propMap = new Map<string, string>();
    this.getAssetsByType('prop').forEach((asset, index) => {
      propMap.set(`prop_${index}`, asset.url);
    });
    return propMap;
  }

  clearAssets(): void {
    this.assets.clear();
    this.loadedUrls.clear();
    console.log('Assets cleared');
  }

  preloadAsset(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.loadedUrls.has(url)) {
        resolve(true);
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedUrls.add(url);
        resolve(true);
      };
      img.onerror = () => {
        console.warn(`Failed to preload asset: ${url}`);
        resolve(false);
      };
      img.src = url;
    });
  }

  async preloadAllAssets(): Promise<void> {
    const urls = Array.from(this.assets.values()).map(asset => asset.url);
    await Promise.all(urls.map(url => this.preloadAsset(url)));
    console.log('All assets preloaded');
  }
}

export const assetManager = AssetManager.getInstance();
