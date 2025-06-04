import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { useGame } from '../../../context/GameContext';
import { type Investigation, type Character, type Clue } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { uploadToCloudinary } from '../../../utils/cloudinaryUpload';
import { generateAssetImage } from '../../../utils/imageGenerator';

export const useInvestigationCreator = () => {
  const [isStartingGame, setIsStartingGame] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const createSimpleInvestigation = async (prompt: string) => {
    try {
      console.log('🎯 Création enquête simple avec prompt:', prompt);
      
      // Créer une enquête basique
      const investigationId = uuidv4();
      const simpleInvestigation: Investigation = {
        id: investigationId,
        title: 'Enquête Simple',
        prompt: prompt,
        description: 'Une enquête créée rapidement',
        context: 'Contexte de base pour cette enquête',
        characters: [
          {
            id: uuidv4(),
            investigation_id: investigationId,
            name: 'Témoin Principal',
            role: 'témoin',
            personality: { traits: ['observateur'] },
            knowledge: 'Informations de base',
            position: { x: 300, y: 300 },
            reputation_score: 50,
            location_description: 'Sur les lieux'
          }
        ],
        status: 'en_cours',
        clues: []
      };

      await startGame(simpleInvestigation, []);
    } catch (error) {
      console.error('Erreur création enquête simple:', error);
      toast.error('Erreur lors de la création de l\'enquête');
    }
  };

  const startGame = async (investigation: Investigation, previewAssets: any[]) => {
    setIsStartingGame(true);
    
    try {
      console.log('🚀 Démarrage du jeu avec investigation:', investigation.title);
      console.log('🎨 Assets preview disponibles:', previewAssets.length);

      // Si on a des assets preview, les utiliser et les sauvegarder sur Cloudinary
      if (previewAssets.length > 0) {
        console.log('📤 Upload des assets vers Cloudinary...');
        
        for (const asset of previewAssets) {
          try {
            console.log(`📤 Upload de l'asset: ${asset.asset_name}`);
            
            // Convertir l'URL d'image en Blob puis en File
            const response = await fetch(asset.image_url);
            if (!response.ok) {
              throw new Error(`Erreur lors du téléchargement de l'image: ${response.status}`);
            }
            
            const blob = await response.blob();
            const fileName = `${asset.asset_name}_${Date.now()}`;
            const file = new File([blob], fileName, { type: blob.type });
            
            // Upload vers Cloudinary avec cloudinaryUpload
            const uploadedUrl = await uploadToCloudinary(file, 'investigations');
            console.log(`✅ Asset "${asset.asset_name}" uploadé vers Cloudinary: ${uploadedUrl}`);

            // Affecter les URLs aux bonnes propriétés de l'investigation
            if (asset.asset_type === 'background' && asset.asset_name === 'main_background') {
              investigation.background_url = uploadedUrl;
            } else if (asset.asset_type === 'character' && asset.characterId) {
              const character = investigation.characters.find(c => c.id === asset.characterId);
              if (character) {
                if (asset.asset_name.includes('portrait')) {
                  character.image_url = uploadedUrl;
                } else if (asset.asset_name.includes('dialog_bg')) {
                  character.dialogue_background_url = uploadedUrl;
                }
              }
            } else if (asset.asset_type === 'prop') {
              const clueName = asset.asset_name.replace('clue_', '').replace(/_/g, ' ');
              const clue = investigation.clues?.find(c => 
                c.name.toLowerCase().replace(/\s+/g, '_') === clueName
              );
              if (clue) {
                clue.image_url = uploadedUrl;
              }
            }

          } catch (error) {
            console.error(`❌ Erreur upload asset ${asset.asset_name}:`, error);
            toast.warning(`Erreur upload ${asset.asset_name}, utilisation de l'image par défaut`);
            // En cas d'erreur, on garde l'URL originale
          }
        }
      } else {
        // Génération d'assets de base si pas d'assets preview
        console.log('🎨 Génération d\'assets de base...');
        
        // Background principal avec prompt amélioré pour vue de haut
        if (investigation.background_prompt && !investigation.background_url) {
          const enhancedBackgroundPrompt = `Vue de haut, perspective aérienne, plateau de jeu 2D, ${investigation.background_prompt}, style cartoon, couleurs vives, adapté pour un jeu d'enquête vue du dessus, topdown view`;
          
          const imageUrl = await generateAssetImage({ 
            description: enhancedBackgroundPrompt, 
            type: 'background' 
          });
          
          if (imageUrl) {
            try {
              // Convertir et uploader
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], `background_${investigation.id}`, { type: blob.type });
              const uploadedUrl = await uploadToCloudinary(file, 'investigations');
              investigation.background_url = uploadedUrl;
            } catch (uploadError) {
              console.warn('⚠️ Échec upload background, utilisation locale:', uploadError);
              investigation.background_url = imageUrl;
            }
          }
        }

        // Images des personnages
        for (const char of investigation.characters) {
          if (char.portrait_prompt && !char.image_url) {
            const imageUrl = await generateAssetImage({ 
              description: char.portrait_prompt, 
              type: 'character' 
            });
            if (imageUrl) {
              try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `character_${char.id}`, { type: blob.type });
                const uploadedUrl = await uploadToCloudinary(file, 'investigations');
                char.image_url = uploadedUrl;
              } catch (uploadError) {
                console.warn(`⚠️ Échec upload ${char.name}:`, uploadError);
                char.image_url = imageUrl;
              }
            }
          }

          if (char.dialog_background_prompt && !char.dialogue_background_url) {
            const imageUrl = await generateAssetImage({ 
              description: char.dialog_background_prompt, 
              type: 'background' 
            });
            if (imageUrl) {
              try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `dialog_${char.id}`, { type: blob.type });
                const uploadedUrl = await uploadToCloudinary(file, 'investigations');
                char.dialogue_background_url = uploadedUrl;
              } catch (uploadError) {
                console.warn(`⚠️ Échec upload dialog ${char.name}:`, uploadError);
                char.dialogue_background_url = imageUrl;
              }
            }
          }
        }

        // Images des indices
        for (const clue of investigation.clues || []) {
          if (clue.image_prompt && !clue.image_url) {
            const imageUrl = await generateAssetImage({ 
              description: clue.image_prompt, 
              type: 'prop' 
            });
            if (imageUrl) {
              try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `clue_${clue.id}`, { type: blob.type });
                const uploadedUrl = await uploadToCloudinary(file, 'investigations');
                clue.image_url = uploadedUrl;
              } catch (uploadError) {
                console.warn(`⚠️ Échec upload clue ${clue.name}:`, uploadError);
                clue.image_url = imageUrl;
              }
            }
          }
        }
      }

      // 1. Sauvegarder l'investigation en base
      const { data: savedInvestigation, error: invError } = await supabase
        .from('investigations')
        .insert({
          id: investigation.id,
          title: investigation.title,
          prompt: investigation.prompt,
          status: investigation.status || 'en_cours',
          player_role: investigation.player_role || 'enquêteur',
          background_url: investigation.background_url,
          player_image_url: investigation.player_image_url,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (invError) {
        console.error('💥 Erreur sauvegarde investigation:', invError);
        throw invError;
      }

      // 2. Sauvegarder les personnages
      if (investigation.characters && investigation.characters.length > 0) {
        const charactersToInsert = investigation.characters.map(char => ({
          id: char.id,
          investigation_id: investigation.id,
          name: char.name,
          role: char.role,
          personality: char.personality as any,
          knowledge: char.knowledge,
          position: char.position,
          reputation_score: char.reputation_score,
          expression_state: char.expression_state || 'neutre',
          alerted: char.alerted || false,
          sprite: char.sprite || 'character',
          location_description: char.location_description,
          image_url: char.image_url,
          dialogue_background_url: char.dialogue_background_url
        }));

        console.log('👥 Sauvegarde des personnages:', charactersToInsert.length);
        
        const { error: charError } = await supabase
          .from('characters')
          .insert(charactersToInsert);

        if (charError) {
          console.error('💥 Erreur sauvegarde personnages:', charError);
          throw charError;
        }
      }

      // 3. Sauvegarder les indices s'il y en a
      if (investigation.clues && investigation.clues.length > 0) {
        const cluesToInsert = investigation.clues.map(clue => ({
          id: clue.id,
          investigation_id: investigation.id,
          name: clue.name,
          description: clue.description,
          location: clue.location,
          image_url: clue.image_url
        }));

        console.log('🔍 Sauvegarde des indices:', cluesToInsert.length);
        
        const { error: clueError } = await supabase
          .from('clues')
          .insert(cluesToInsert);

        if (clueError) {
          console.error('💥 Erreur sauvegarde indices:', clueError);
          throw clueError;
        }
      }

      // 4. Charger l'investigation dans le contexte du jeu
      dispatch({
        type: 'SET_INVESTIGATION',
        payload: investigation
      });

      console.log('✅ Jeu démarré avec succès');
      toast.success('Enquête créée et jeu démarré !');
      
      // Naviguer vers le jeu avec l'ID de l'investigation
      navigate(`/game/${investigation.id}`);
      
    } catch (error) {
      console.error('💥 Erreur lors du démarrage du jeu:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsStartingGame(false);
    }
  };

  return {
    isStartingGame,
    createSimpleInvestigation,
    startGame
  };
};
