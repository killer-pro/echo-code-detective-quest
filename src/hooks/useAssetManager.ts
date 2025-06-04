
import { useEffect } from 'react';
import { assetManager } from '../utils/assetManager';
import { DEMO_INVESTIGATION } from '../data/demoInvestigation';
import { useAssetInitialization } from './useAssetInitialization';
import { useDemoAssets } from './useDemoAssets';
import { useDatabaseAssets } from './useDatabaseAssets';

export const useAssetManager = (investigationId: string | null) => {
  const { 
    assetsInitialized, 
    markAsInitialized, 
    resetInitialization 
  } = useAssetInitialization();
  
  const { initializeDemoAssets } = useDemoAssets();
  const { initializeDatabaseAssets } = useDatabaseAssets();

  useEffect(() => {
    if (investigationId && !assetsInitialized) {
      console.log('🎮 useAssetManager: Initialisation des assets...');
      initializeAssets();
    }
  }, [investigationId, assetsInitialized]);

  const initializeAssets = async () => {
    if (!investigationId) {
      console.warn('⚠️ useAssetManager: Aucune investigation courante');
      return;
    }

    console.log('🔧 useAssetManager: Initialisation AssetManager pour investigation:', investigationId);
    assetManager.setCurrentInvestigation(investigationId);

    if (investigationId === DEMO_INVESTIGATION.id) {
      await initializeDemoAssets(investigationId);
      markAsInitialized();
      return;
    }

    try {
      await initializeDatabaseAssets();
      markAsInitialized();
    } catch (error) {
      console.error('💥 useAssetManager: Erreur lors de l\'initialisation:', error);
      markAsInitialized();
    }
  };

  return {
    assetsInitialized,
    initializeAssets,
  };
};
