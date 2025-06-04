import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { useGame } from '../../../context/GameContext';
import { type Investigation, type Character, type Clue } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { cloudinaryService } from '../../../utils/cloudinaryService';
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
            // Stocker en cache local pour rapidité
            localStorage.setItem(`asset_${asset.asset_name}_${investigation.id}`, asset.image_url);

            // Upload vers Cloudinary avec gestion d'erreur améliorée
            let uploadedUrl = asset.image_url; // Fallback sur l'URL originale
            
            try {
              uploadedUrl = await cloudinaryService.uploadImageFromUrl(
                asset.image_url, 
                `${investigation.id}/${asset.asset_name}`
              );
              console.log(`✅ Asset "${asset.asset_name}" uploadé vers Cloudinary: ${uploadedUrl}`);
            } catch (uploadError) {
              console.warn(`⚠️ Échec upload Cloudinary pour ${asset.asset_name}, utilisation de l'URL locale:`, uploadError);
              toast.warning(`Asset ${asset.asset_name} sauvé localement seulement`);
            }

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

            console.log(`✅ Asset "${asset.asset_name}" assigné à l'investigation`);
          } catch (error) {
            console.error(`❌ Erreur traitement asset ${asset.asset_name}:`, error);
            toast.error(`Erreur asset ${asset.asset_name}`);
          }
        }
      } else {
        // Génération d'assets de base si pas d'assets preview
        console.log('🎨 Génération d\'assets de base...');
        
        // Background principal avec prompt amélioré
        if (investigation.background_prompt && !investigation.background_url) {
          const enhancedBackgroundPrompt = `Vue de haut, perspective aérienne, plateau de jeu 2D, ${investigation.background_prompt}, style cartoon, couleurs vives, adapté pour un jeu d'enquête vue du dessus`;
          
          const imageUrl = await generateAssetImage({ 
            description: enhancedBackgroundPrompt, 
            type: 'background' 
          });
          if (imageUrl) {
            localStorage.setItem(`asset_main_background_${investigation.id}`, imageUrl);
            
            try {
              const uploadedUrl = await cloudinaryService.uploadImageFromUrl(
                imageUrl, 
                `${investigation.id}/main_background`
              );
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
              const uploadedUrl = await cloudinaryService.uploadImageFromUrl(
                imageUrl, 
                `${investigation.id}/character_${char.id}`
              );
              char.image_url = uploadedUrl;
              localStorage.setItem(`asset_character_${char.id}_${investigation.id}`, imageUrl);
            }
          }

          if (char.dialog_background_prompt && !char.dialogue_background_url) {
            const imageUrl = await generateAssetImage({ 
              description: char.dialog_background_prompt, 
              type: 'background' 
            });
            if (imageUrl) {
              const uploadedUrl = await cloudinaryService.uploadImageFromUrl(
                imageUrl, 
                `${investigation.id}/dialog_${char.id}`
              );
              char.dialogue_background_url = uploadedUrl;
              localStorage.setItem(`asset_dialog_${char.id}_${investigation.id}`, imageUrl);
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
              const uploadedUrl = await cloudinaryService.uploadImageFromUrl(
                imageUrl, 
                `${investigation.id}/clue_${clue.id}`
              );
              clue.image_url = uploadedUrl;
              localStorage.setItem(`asset_clue_${clue.id}_${investigation.id}`, imageUrl);
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
