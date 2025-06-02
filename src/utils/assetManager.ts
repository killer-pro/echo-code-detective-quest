
import { loadAssetsFromDatabase, saveGeneratedAssetToDatabase } from './imageGenerator';

interface AssetData {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
  characterId?: string;
}

export class AssetManager {
  private static instance: AssetManager;
  private assets: Map<string, AssetData> = new Map();
  private loadedUrls: Set<string> = new Set();
  private currentInvestigationId: string | null = null;

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  setCurrentInvestigation(investigationId: string): void {
    this.currentInvestigationId = investigationId;
    this.loadAssetsFromDatabase();
  }

  async loadAssetsFromDatabase(): Promise<void> {
    if (!this.currentInvestigationId) return;

    try {
      const dbAssets = await loadAssetsFromDatabase(this.currentInvestigationId);
      
      dbAssets.forEach(asset => {
        this.assets.set(asset.asset_name, {
          name: asset.asset_name,
          url: asset.image_url,
          type: asset.asset_type as 'background' | 'character' | 'prop'
        });
      });

      console.log(`${dbAssets.length} assets chargés depuis la base de données`);
    } catch (error) {
      console.error('Erreur lors du chargement des assets depuis la DB:', error);
    }
  }

  async addAsset(asset: AssetData, prompt?: string): Promise<void> {
    this.assets.set(asset.name, asset);
    console.log(`Asset ajouté: ${asset.name} (${asset.type})`);

    // Sauvegarder en base de données si on a un ID d'enquête
    if (this.currentInvestigationId && prompt) {
      await saveGeneratedAssetToDatabase(
        this.currentInvestigationId,
        asset.name,
        asset.type,
        asset.url,
        prompt
      );
    }
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
    const characters = this.getAssetsByType('character');
    
    characters.forEach((asset, index) => {
      // Utiliser le characterId s'il existe, sinon un index
      const key = asset.characterId || `character_${index}`;
      characterMap.set(key, asset.url);
    });
    
    return characterMap;
  }

  getCharacterAssetByName(characterName: string): string | null {
    const characterAssets = this.getAssetsByType('character');
    const asset = characterAssets.find(asset => 
      asset.name.toLowerCase().includes(characterName.toLowerCase()) ||
      asset.characterId === characterName
    );
    return asset ? asset.url : null;
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
