
import { assetManager } from '../utils/assetManager';
import { DEMO_INVESTIGATION } from '../data/demoInvestigation';
import { SVGFallbacks } from '../utils/svgFallbacks';

export const useDemoAssets = () => {
  const initializeDemoAssets = async (investigationId: string) => {
    console.log('🔧 useDemoAssets: Utilisation des assets de démo (enregistrement local)...');

    for (const character of DEMO_INVESTIGATION.characters) {
      const characterAsset = {
        name: `character_${character.name.toLowerCase().replace(/\s+/g, '_')}`,
        url: SVGFallbacks.generateCharacterSVG(character.name, character.role),
        type: 'character' as const,
        characterId: character.name.toLowerCase()
      };
      assetManager.registerLocalAsset(characterAsset);
      console.log(`👤 useDemoAssets: Asset démo local enregistré pour: ${character.name}`);
    }

    const backgroundAsset = {
      name: 'manoir_blackwood_background',
      url: SVGFallbacks.generateBackgroundSVG(DEMO_INVESTIGATION.title),
      type: 'background' as const
    };
    assetManager.registerLocalAsset(backgroundAsset);
    console.log('🏠 useDemoAssets: Asset arrière-plan de démo local enregistré');

    const propAsset = {
      name: 'prop_murder_weapon',
      url: SVGFallbacks.generatePropSVG('Arme du crime'),
      type: 'prop' as const
    };
    assetManager.registerLocalAsset(propAsset);
    console.log('🔪 useDemoAssets: Asset prop de démo local enregistré');

    assetManager.markAsReadyForLocalAssets();
    console.log('✅ useDemoAssets: Assets de démo enregistrés et AssetManager marqué prêt');
  };

  return {
    initializeDemoAssets,
  };
};
