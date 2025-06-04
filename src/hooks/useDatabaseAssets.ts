
import { assetManager } from '../utils/assetManager';

export const useDatabaseAssets = () => {
  const initializeDatabaseAssets = async () => {
    try {
      console.log('🔧 useDatabaseAssets: Chargement depuis la base de données...');
      await assetManager.loadAssetsFromDatabase();

      console.log('✅ useDatabaseAssets: Assets de base de données initialisés avec succès');
      return true;
    } catch (error) {
      console.error('💥 useDatabaseAssets: Erreur lors de l\'initialisation:', error);
      throw error;
    }
  };

  return {
    initializeDatabaseAssets,
  };
};
