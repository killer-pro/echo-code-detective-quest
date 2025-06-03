import { useState, useEffect } from 'react';
import { assetManager } from '../utils/assetManager';
import { DEMO_INVESTIGATION } from '../data/demoInvestigation';
import { SVGFallbacks } from '../utils/svgFallbacks';

export const useAssetManager = (investigationId: string | null) => {
  const [assetsInitialized, setAssetsInitialized] = useState(false);

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
      console.log('🔧 useAssetManager: Utilisation des assets de démo (enregistrement local)...');

      for (const character of DEMO_INVESTIGATION.characters) {
        const characterAsset = {
          name: `character_${character.name.toLowerCase().replace(/\s+/g, '_')}`,
          url: SVGFallbacks.generateCharacterSVG(character.name, character.role),
          type: 'character' as const,
          characterId: character.name.toLowerCase()
        };
        assetManager.registerLocalAsset(characterAsset);
        console.log(`👤 useAssetManager: Asset démo local enregistré pour: ${character.name}`);
      }

      const backgroundAsset = {
        name: 'manoir_blackwood_background',
        url: SVGFallbacks.generateBackgroundSVG(DEMO_INVESTIGATION.title),
        type: 'background' as const
      };
      assetManager.registerLocalAsset(backgroundAsset);
      console.log('🏠 useAssetManager: Asset arrière-plan de démo local enregistré');

      const propAsset = {
        name: 'prop_murder_weapon',
        url: SVGFallbacks.generatePropSVG('Arme du crime'),
        type: 'prop' as const
      };
      assetManager.registerLocalAsset(propAsset);
      console.log('🔪 useAssetManager: Asset prop de démo local enregistré');

      assetManager.markAsReadyForLocalAssets();
      console.log('✅ useAssetManager: Assets de démo enregistrés et AssetManager marqué prêt');
      setAssetsInitialized(true);

      return;
    }

    try {
      console.log('🔧 useAssetManager: Chargement depuis la base de données...');
      await assetManager.loadAssetsFromDatabase();

      console.log('✅ useAssetManager: Assets de base de données initialisés avec succès');
      setAssetsInitialized(true);
    } catch (error) {
      console.error('💥 useAssetManager: Erreur lors de l\'initialisation:', error);
      setAssetsInitialized(true);
    }
  };

  return {
    assetsInitialized,
    initializeAssets,
  };
};
