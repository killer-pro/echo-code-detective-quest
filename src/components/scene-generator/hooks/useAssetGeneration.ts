import { useState } from 'react';
import { generateAssetImage, type GenerateImageParams, getValidImageStyle } from '@/utils/imageGenerator.ts';
import { v4 as uuidv4 } from 'uuid';
import {AssetType, GeneratedAsset, Investigation} from "@/types";

interface UseAssetGenerationProps {
  investigation: Investigation;
}

interface AssetToGenerate {
  id: string;
  investigation_id: string;
  asset_type: AssetType;
  asset_name: string;
  description: string;
  prompt: string;
  characterId?: string;
  style?: GenerateImageParams['style'];
  locationContext?: string;
}

export const useAssetGeneration = ({ investigation }: UseAssetGenerationProps) => {
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingAssetId, setRegeneratingAssetId] = useState<string | null>(null);

  const generateAssets = async () => {
    setIsLoading(true);
    setError(null);
    setRegeneratingAssetId(null);

    try {
      const initialAssets: AssetToGenerate[] = [];
      const investigationId = investigation.id;

      if (investigation.background_prompt) {
        console.log(`🎯 Collecting prompt for background: ${investigation.title}`);

        initialAssets.push({
          id: uuidv4(),
          investigation_id: investigationId,
          asset_type: 'background',
          asset_name: 'main_background',
          description: investigation.background_prompt,
          prompt: investigation.background_prompt,
          style: 'cartoon',
          locationContext: 'Main investigation area'
        });
      }

      if (investigation.characters && investigation.characters.length > 0) {
        for (const character of investigation.characters) {
          if (character.portrait_prompt) {
            console.log(`🎯 Collecting prompt for character portrait: ${character.name}`);

            initialAssets.push({
              id: uuidv4(),
              investigation_id: investigationId,
              asset_type: 'character',
              asset_name: `${character.name}_portrait`,
              description: character.portrait_prompt,
              prompt: character.portrait_prompt,
              characterId: character.id,
              style: 'cartoon',
              locationContext: character.location_description
            });
          }

          if (character.dialog_background_prompt) {
            console.log(`🎯 Collecting prompt for character dialog background: ${character.name}`);

            initialAssets.push({
              id: uuidv4(),
              investigation_id: investigationId,
              asset_type: 'background',
              asset_name: `${character.name}_dialog_bg`,
              description: character.dialog_background_prompt,
              prompt: character.dialog_background_prompt,
              characterId: character.id,
              style: 'cartoon',
              locationContext: character.location_description
            });
          }
        }
      }

      if (investigation.clues && investigation.clues.length > 0) {
        for (const clue of investigation.clues) {
          if (clue.image_prompt) {
            console.log(`🎯 Collecting prompt for clue: ${clue.name}`);

            initialAssets.push({
              id: uuidv4(),
              investigation_id: investigationId,
              asset_type: 'prop',
              asset_name: clue.name,
              description: clue.image_prompt,
              prompt: clue.image_prompt,
              style: 'cartoon',
              locationContext: clue.location
            });
          }
        }
      }

      console.log(`✨ Generating images for ${initialAssets.length} assets...`);

      const generatedAssetsWithUrls: GeneratedAsset[] = await Promise.all(initialAssets.map(async (assetData) => {
        const imageUrl = await generateAssetImage({
          description: assetData.description,
          type: assetData.asset_type as GenerateImageParams['type'],
          style: getValidImageStyle(assetData.style)
        });

        return {
          ...assetData,
          image_url: imageUrl || '',
        } as GeneratedAsset;
      }));

      setAssets(generatedAssetsWithUrls);
      console.log('✅ Assets generated with URLs:', generatedAssetsWithUrls);
    } catch (err) {
      console.error('💥 Error during asset generation:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate assets');
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateAsset = async (assetId: string, prompt: string, assetType: AssetType, style?: GenerateImageParams['style']) => {
    setRegeneratingAssetId(assetId);
    setError(null);

    try {
      console.log(`🔁 Regenerating asset with ID: ${assetId}`);
      const imageUrl = await generateAssetImage({
        description: prompt,
        type: assetType as GenerateImageParams['type'],
        style: getValidImageStyle(style),
      });

      setAssets(prevAssets =>
        prevAssets.map(asset =>
          asset.id === assetId ? { ...asset, image_url: imageUrl || '' } : asset
        )
      );

      console.log(`✅ Asset ${assetId} regenerated.`);

    } catch (err) {
      console.error(`💥 Error regenerating asset ${assetId}:`, err);
      setError(`Failed to regenerate asset ${assetId}`);
    } finally {
      setRegeneratingAssetId(null);
    }
  };

  return {
    assets,
    isLoading,
    error,
    regeneratingAssetId,
    generateAssets,
    regenerateAsset,
  };
};
