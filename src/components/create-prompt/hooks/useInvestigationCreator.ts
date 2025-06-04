import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { useGame } from '../../../context/GameContext';
import { type Investigation, type Character, type Clue } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CloudinaryUploadService } from '../../../utils/cloudinaryUpload';
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

      // Génération et upload des images pour chaque asset
      // 1. Background général
      if (investigation.background_prompt && !investigation.background_url) {
        const imageUrl = await generateAssetImage({ description: investigation.background_prompt, type: 'background' });
        const uploadResult = await CloudinaryUploadService.uploadImageFromUrl(imageUrl, `investigations/${investigation.id}_background`);
        investigation.background_url = uploadResult.secure_url;
      }

      // 2. Personnages
      for (const char of investigation.characters) {
        // Portrait
        if (char.portrait_prompt && !char.image_url) {
          const imageUrl = await generateAssetImage({ description: char.portrait_prompt, type: 'character' });
          const uploadResult = await CloudinaryUploadService.uploadImageFromUrl(imageUrl, `characters/${char.id}_portrait`);
          char.image_url = uploadResult.secure_url;
        }
        // Background de dialogue
        if (char.dialog_background_prompt && !char.dialogue_background_url) {
          const imageUrl = await generateAssetImage({ description: char.dialog_background_prompt, type: 'background' });
          const uploadResult = await CloudinaryUploadService.uploadImageFromUrl(imageUrl, `characters/${char.id}_dialog_bg`);
          char.dialogue_background_url = uploadResult.secure_url;
        }
      }

      // 3. Indices
      for (const clue of investigation.clues || []) {
        if (clue.image_prompt && !clue.image_url) {
          const imageUrl = await generateAssetImage({ description: clue.image_prompt, type: 'prop' });
          const uploadResult = await CloudinaryUploadService.uploadImageFromUrl(imageUrl, `clues/${clue.id}`);
          clue.image_url = uploadResult.secure_url;
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
          personality: char.personality as any, // Cast to any for JSON compatibility
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
