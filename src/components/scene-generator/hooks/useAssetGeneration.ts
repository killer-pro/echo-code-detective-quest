
import { useState } from 'react';
import { generateAssetImage, getValidImageStyle } from '../../../utils/imageGenerator';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { type Investigation, type GeneratedAsset } from '../../../types';

export const useAssetGeneration = (investigation: Investigation) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [regeneratingAsset, setRegeneratingAsset] = useState<string | null>(null);

  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 10000);
    });
  };

  const generateSceneAssets = async (onAssetsGenerated?: (assets: GeneratedAsset[]) => void) => {
    setIsGenerating(true);
    console.log('🎨 Début génération des assets pour investigation (preview mode):', investigation.id);
    
    try {
      const generatedAssetsList: GeneratedAsset[] = [];

      // 1. Background principal de l'investigation
      if (investigation.background_prompt) {
        console.log('🏠 Génération fond investigation:', investigation.background_prompt);
        const imageUrl = await generateAssetImage({
          description: investigation.background_prompt,
          style: 'cartoon',
          type: 'background'
        });

        if (imageUrl) {
          const isValid = await validateImageUrl(imageUrl);
          if (isValid) {
            generatedAssetsList.push({
              id: uuidv4(),
              investigation_id: investigation.id,
              asset_name: 'main_background',
              asset_type: 'background',
              image_url: imageUrl,
              prompt: investigation.background_prompt,
              style: 'cartoon',
            });
            console.log('✅ Fond investigation généré');
          } else {
            toast.error('Échec validation image de fond');
          }
        } else {
          toast.error('Échec génération image de fond');
        }
      } else {
        console.error('❌ Prompt background investigation manquant');
        toast.error('Prompt background investigation manquant');
      }

      // 2. Assets des personnages
      for (const char of investigation.characters || []) {
        console.log(`👤 Génération assets pour ${char.name}`);
        
        // Portrait du personnage
        if (char.portrait_prompt) {
          const portraitUrl = await generateAssetImage({
            description: char.portrait_prompt,
            style: 'cartoon',
            type: 'character'
          });

          if (portraitUrl) {
            const isValid = await validateImageUrl(portraitUrl);
            if (isValid) {
              generatedAssetsList.push({
                id: uuidv4(),
                investigation_id: investigation.id,
                asset_name: `portrait_${char.name.toLowerCase().replace(/\s+/g, '_')}`,
                asset_type: 'character',
                image_url: portraitUrl,
                prompt: char.portrait_prompt,
                style: 'cartoon',
                characterId: char.id,
              });
              console.log(`✅ Portrait généré pour ${char.name}`);
            }
          } else {
            toast.error(`Échec génération portrait pour ${char.name}`);
          }
        } else {
          console.error(`❌ Prompt portrait manquant pour ${char.name}`);
          toast.error(`Prompt portrait manquant pour ${char.name}`);
        }

        // Background de dialogue du personnage
        if (char.dialog_background_prompt) {
          const dialogBgUrl = await generateAssetImage({
            description: char.dialog_background_prompt,
            style: 'cartoon',
            type: 'background'
          });

          if (dialogBgUrl) {
            const isValid = await validateImageUrl(dialogBgUrl);
            if (isValid) {
              generatedAssetsList.push({
                id: uuidv4(),
                investigation_id: investigation.id,
                asset_name: `dialog_bg_${char.name.toLowerCase().replace(/\s+/g, '_')}`,
                asset_type: 'background',
                image_url: dialogBgUrl,
                prompt: char.dialog_background_prompt,
                style: 'cartoon',
                characterId: char.id,
                locationContext: char.location_description,
              });
              console.log(`✅ Background dialogue généré pour ${char.name}`);
            }
          } else {
            toast.error(`Échec génération background dialogue pour ${char.name}`);
          }
        } else {
          console.error(`❌ Prompt background dialogue manquant pour ${char.name}`);
          toast.error(`Prompt background dialogue manquant pour ${char.name}`);
        }
      }

      // 3. Assets des indices
      for (const clue of investigation.clues || []) {
        console.log(`🔍 Génération asset pour indice ${clue.name}`);
        
        if (clue.image_prompt) {
          const clueUrl = await generateAssetImage({
            description: clue.image_prompt,
            style: 'cartoon',
            type: 'prop'
          });

          if (clueUrl) {
            const isValid = await validateImageUrl(clueUrl);
            if (isValid) {
              generatedAssetsList.push({
                id: uuidv4(),
                investigation_id: investigation.id,
                asset_name: `clue_${clue.name.toLowerCase().replace(/\s+/g, '_')}`,
                asset_type: 'prop',
                image_url: clueUrl,
                prompt: clue.image_prompt,
                style: 'cartoon',
              });
              console.log(`✅ Asset indice généré pour ${clue.name}`);
            }
          } else {
            toast.error(`Échec génération asset pour indice ${clue.name}`);
          }
        } else {
          console.error(`❌ Prompt image manquant pour indice ${clue.name}`);
          toast.error(`Prompt image manquant pour indice ${clue.name}`);
        }
      }

      setGeneratedAssets(generatedAssetsList);
      if (onAssetsGenerated) {
        onAssetsGenerated(generatedAssetsList);
      }
      
      console.log(`🎉 Génération terminée: ${generatedAssetsList.length} assets créés`);
      toast.success(`${generatedAssetsList.length} assets générés avec succès`);
      
    } catch (error) {
      console.error('💥 Erreur lors de la génération des assets:', error);
      toast.error('Erreur lors de la génération des assets');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateAsset = async (assetIndex: number, onAssetsGenerated?: (assets: GeneratedAsset[]) => void) => {
    const asset = generatedAssets[assetIndex];
    if (!asset) return;

    setRegeneratingAsset(asset.asset_name);
    console.log(`🔄 Régénération de l'asset: ${asset.asset_name}`);
    
    try {
      toast.info(`Régénération de "${asset.asset_name}" en cours...`);
      
      const enhancedPrompt = `${asset.prompt}, variation ${Date.now()}, style variant`;
      
      const newImageUrl = await generateAssetImage({
        description: enhancedPrompt,
        style: getValidImageStyle(asset.style || 'cartoon'),
        type: asset.asset_type
      });

      if (newImageUrl) {
        const isValid = await validateImageUrl(newImageUrl);
        if (isValid) {
          const updatedAssets = [...generatedAssets];
          const updatedAsset: GeneratedAsset = {
            ...asset,
            image_url: newImageUrl,
          };
          updatedAssets[assetIndex] = updatedAsset;
          
          setGeneratedAssets(updatedAssets);
          if (onAssetsGenerated) {
            onAssetsGenerated(updatedAssets);
          }
          
          console.log(`✅ Asset "${updatedAsset.asset_name}" régénéré`);
          toast.success(`Asset "${updatedAsset.asset_name}" régénéré avec succès`);
        } else {
          throw new Error('Validation de la nouvelle image échouée');
        }
      } else {
        throw new Error('Génération de la nouvelle image échouée');
      }
    } catch (error) {
      console.error(`💥 Erreur lors de la régénération de ${asset.asset_name}:`, error);
      toast.error(`Erreur lors de la régénération de "${asset.asset_name}"`);
    } finally {
      setRegeneratingAsset(null);
    }
  };

  return {
    isGenerating,
    generatedAssets,
    regeneratingAsset,
    generateSceneAssets,
    regenerateAsset,
  };
};
