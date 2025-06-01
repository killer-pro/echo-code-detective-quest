
interface AssetDownload {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
}

export class AssetManager {
  private static instance: AssetManager;
  private downloadedAssets: Map<string, string> = new Map();

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  async downloadAsset(asset: AssetDownload): Promise<string | null> {
    try {
      console.log(`Téléchargement de ${asset.name} depuis ${asset.url}`);
      
      // Dans un vrai projet, on utiliserait une API pour télécharger les assets
      // Ici on simule le processus et on retourne une URL locale
      
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `${asset.type}_${asset.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      
      // Créer une URL locale pour l'asset
      const localUrl = URL.createObjectURL(blob);
      
      // Stocker dans notre cache
      this.downloadedAssets.set(asset.name, localUrl);
      
      console.log(`Asset ${asset.name} téléchargé avec succès: ${fileName}`);
      return localUrl;
      
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${asset.name}:`, error);
      return null;
    }
  }

  getAsset(name: string): string | null {
    return this.downloadedAssets.get(name) || null;
  }

  getAllAssets(): Map<string, string> {
    return new Map(this.downloadedAssets);
  }

  clearAssets(): void {
    // Libérer les URLs créées
    this.downloadedAssets.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.downloadedAssets.clear();
  }

  // Méthodes pour organiser les assets par type
  getBackgrounds(): string[] {
    return Array.from(this.downloadedAssets.entries())
      .filter(([name]) => name.toLowerCase().includes('background') || name.toLowerCase().includes('manor') || name.toLowerCase().includes('village'))
      .map(([, url]) => url);
  }

  getCharacterSprites(): string[] {
    return Array.from(this.downloadedAssets.entries())
      .filter(([name]) => name.toLowerCase().includes('sprite') || name.toLowerCase().includes('character'))
      .map(([, url]) => url);
  }

  getProps(): string[] {
    return Array.from(this.downloadedAssets.entries())
      .filter(([name]) => name.toLowerCase().includes('prop') || name.toLowerCase().includes('evidence') || name.toLowerCase().includes('magnifying'))
      .map(([, url]) => url);
  }
}

export const assetManager = AssetManager.getInstance();
