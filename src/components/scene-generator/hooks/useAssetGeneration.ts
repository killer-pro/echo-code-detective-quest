import { useState } from 'react';
import { type Investigation, type GeneratedAsset } from '../../types';

interface UseAssetGenerationProps {
  investigation: Investigation;
}

export const useAssetGeneration = ({ investigation }: UseAssetGenerationProps) => {
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAssets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAssets: GeneratedAsset[] = [];

      // Generate background asset
      if (investigation.background_prompt) {
        console.log(`🎯 Generating asset for background: ${investigation.title}`);

        const assetData = {
          asset_type: 'background' as const,
          asset_name: 'main_background',
          description: investigation.background_prompt,
          characterId: undefined,
        };

        newAssets.push(assetData);
      }

      // Generate assets for each character
      if (investigation.characters && investigation.characters.length > 0) {
        for (const character of investigation.characters) {
          if (character.portrait_prompt) {
            console.log(`🎯 Generating asset for character: ${character.name}`);

            const assetData = {
              asset_type: 'character' as const,
              asset_name: `${character.name}_portrait`,
              description: character.portrait_prompt,
              characterId: character.id,
            };

            newAssets.push(assetData);
          }

          if (character.dialog_background_prompt) {
            console.log(`🎯 Generating dialog background for character: ${character.name}`);

            const assetData = {
              asset_type: 'character' as const,
              asset_name: `${character.name}_dialog_bg`,
              description: character.dialog_background_prompt,
              characterId: character.id,
            };

            newAssets.push(assetData);
          }
        }
      }

      // Generate assets for each clue
      if (investigation.clues && investigation.clues.length > 0) {
        for (const clue of investigation.clues) {
          if (clue.image_prompt) {
            console.log(`🎯 Generating asset for clue: ${clue.name}`);
            
            const assetData = {
              asset_type: 'prop' as const,
              asset_name: clue.name,
              description: clue.image_prompt,
              characterId: undefined,
              // Remove clueId since it doesn't exist in GeneratedAsset type
            };

            newAssets.push(assetData);
          }
        }
      }

      setAssets(newAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate assets');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assets,
    isLoading,
    error,
    generateAssets,
  };
};
