import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../integrations/supabase/client';
import { useGame } from '../../../context/GameContext';
import { type Investigation, type Character, type Clue, GeneratedAsset } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { cloudinaryUploadService } from '../../../utils/cloudinaryUpload';
import { generateAssetImage } from '../../../utils/imageGenerator';
import { type Json } from '../../../integrations/supabase/types';

export const useInvestigationCreator = () => {
  const [isStartingGame, setIsStartingGame] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const createSimpleInvestigation = async (prompt: string) => {
    try {
      console.log('🎯 Creating simple investigation with prompt:', prompt);
      
      // Create a basic investigation
      const investigationId = uuidv4();
      const simpleInvestigation: Investigation = {
        id: investigationId,
        title: 'Simple Investigation',
        prompt: prompt,
        description: 'A quickly created investigation',
        context: 'Basic context for this investigation',
        characters: [
          {
            id: uuidv4(),
            investigation_id: investigationId,
            name: 'Main Witness',
            role: 'témoin',
            personality: { traits: ['observateur'] },
            knowledge: 'Basic information',
            position: { x: 300, y: 300 },
            reputation_score: 50,
            location_description: 'At the scene'
          }
        ],
        status: 'en_cours',
        clues: [],
        player_image_url: 'https://res.cloudinary.com/dyvgd3xak/image/upload/v1748974162/bb1ac672-1096-498c-9287-dd7626326b26/character/D%C3%A9tective_1748974160161.jpg'
      };

      await startGame(simpleInvestigation, []);
    } catch (error) {
      console.error('Error creating simple investigation:', error);
      toast.error('Error creating investigation');
    }
  };

  const startGame = async (investigation: Investigation, previewAssets: GeneratedAsset[]) => {
    setIsStartingGame(true);
    
    try {
      console.log('🚀 Starting game with investigation:', investigation.title);
      console.log('🎨 Available preview assets:', previewAssets.length);

      // Add default player image if not already defined
      if (!investigation.player_image_url) {
        investigation.player_image_url = 'https://res.cloudinary.com/dyvgd3xak/image/upload/v1748974162/bb1ac672-1096-498c-9287-dd7626326b26/character/D%C3%A9tective_1748974160161.jpg';
      }

      // If we have preview assets, use them and save to Cloudinary
      if (previewAssets.length > 0) {
        console.log('📤 Uploading assets to Cloudinary...');
        
        for (const asset of previewAssets) {
          try {
            console.log(`📤 Uploading asset: ${asset.asset_name}`);
            
            // Use cloudinaryUploadService to upload the image
            const publicId = `${asset.asset_name}_${Date.now()}`;
            const uploadResult = await cloudinaryUploadService.uploadImageFromUrl(asset.image_url, publicId);
            console.log(`✅ Asset "${asset.asset_name}" uploaded to Cloudinary: ${uploadResult.secure_url}`);

            // Assign URLs to the right investigation properties
            if (asset.asset_type === 'background' && asset.asset_name === 'main_background') {
              investigation.background_url = uploadResult.secure_url;
            } else if (asset.asset_type === 'character' && asset.characterId) {
              const character = investigation.characters.find(c => c.id === asset.characterId);
              if (character) {
                if (asset.asset_name.includes('portrait')) {
                  character.image_url = uploadResult.secure_url;
                } else if (asset.asset_name.includes('dialog_bg')) {
                  character.dialogue_background_url = uploadResult.secure_url;
                  console.log('Adding dialogue_background_url for', character.name, uploadResult.secure_url);
                }
              }
            } else if (asset.asset_type === 'prop') {
              // Find matching clue by name instead of clueId
              const clue = investigation.clues?.find(c => c.name === asset.asset_name);
              if (clue) {
                clue.image_url = uploadResult.secure_url;
              }
            }

          } catch (error) {
            console.error(`❌ Error uploading asset ${asset.asset_name}:`, error);
            toast.warning(`Error uploading ${asset.asset_name}, using default image`);
            // In case of error, keep the original URL
          }
        }
      } else {
        // Generate basic assets if no preview assets
        console.log('🎨 Generating basic assets...');
        
        // Main background with improved prompt for top-down view
        if (investigation.background_prompt && !investigation.background_url) {
          const enhancedBackgroundPrompt = `Isometric top view, aerial perspective, 2D game board cartoon style, ${investigation.background_prompt}, top-down view, scene suitable for placing characters on, board game style top view, bright and contrasted colors, bird's eye view perspective`;
          
          const imageUrl = await generateAssetImage({ 
            description: enhancedBackgroundPrompt, 
            type: 'background' 
          });
          
          if (imageUrl) {
            try {
              // Use cloudinaryUploadService to upload
              const publicId = `background_${investigation.id}`;
              const uploadResult = await cloudinaryUploadService.uploadImageFromUrl(imageUrl, publicId);
              investigation.background_url = uploadResult.secure_url;
            } catch (uploadError) {
              console.warn('⚠️ Background upload failed, using local:', uploadError);
              investigation.background_url = imageUrl;
            }
          }
        }

        // Character images
        for (const char of investigation.characters) {
          if (char.portrait_prompt && !char.image_url) {
            const imageUrl = await generateAssetImage({ 
              description: char.portrait_prompt, 
              type: 'character' 
            });
            if (imageUrl) {
              try {
                const publicId = `character_${char.id}`;
                const uploadResult = await cloudinaryUploadService.uploadImageFromUrl(imageUrl, publicId);
                char.image_url = uploadResult.secure_url;
              } catch (uploadError) {
                console.warn(`⚠️ Upload failed for ${char.name}:`, uploadError);
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
                const publicId = `dialog_${char.id}`;
                const uploadResult = await cloudinaryUploadService.uploadImageFromUrl(imageUrl, publicId);
                char.dialogue_background_url = uploadResult.secure_url;
              } catch (uploadError) {
                console.warn(`⚠️ Dialog upload failed for ${char.name}:`, uploadError);
                char.dialogue_background_url = imageUrl;
              }
            }
          }
        }

        // Clue images
        for (const clue of investigation.clues || []) {
          if (clue.image_prompt && !clue.image_url) {
            const imageUrl = await generateAssetImage({ 
              description: clue.image_prompt, 
              type: 'prop' 
            });
            if (imageUrl) {
              try {
                const publicId = `clue_${clue.id}`;
                const uploadResult = await cloudinaryUploadService.uploadImageFromUrl(imageUrl, publicId);
                clue.image_url = uploadResult.secure_url;
              } catch (uploadError) {
                console.warn(`⚠️ Clue upload failed for ${clue.name}:`, uploadError);
                clue.image_url = imageUrl;
              }
            }
          }
        }
      }

      // 1. Save investigation to database
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
        console.error('💥 Error saving investigation:', invError);
        throw invError;
      }

      // 2. Save characters
      if (investigation.characters && investigation.characters.length > 0) {
        const charactersToInsert = investigation.characters.map(char => ({
          id: char.id,
          investigation_id: investigation.id,
          name: char.name,
          role: char.role,
          personality: char.personality as Json,
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

        charactersToInsert.forEach(c => {
          console.log('Character to insert:', c.name, 'dialogue_background_url:', c.dialogue_background_url);
        });
        
        const { error: charError } = await supabase
          .from('characters')
          .insert(charactersToInsert);

        if (charError) {
          console.error('💥 Error saving characters:', charError);
          throw charError;
        }
      }

      // 3. Save clues if any
      if (investigation.clues && investigation.clues.length > 0) {
        const cluesToInsert = investigation.clues.map(clue => ({
          id: clue.id,
          investigation_id: investigation.id,
          name: clue.name,
          description: clue.description,
          location: clue.location,
          image_url: clue.image_url
        }));

        console.log('🔍 Saving clues:', cluesToInsert.length);
        
        const { error: clueError } = await supabase
          .from('clues')
          .insert(cluesToInsert);

        if (clueError) {
          console.error('💥 Error saving clues:', clueError);
          throw clueError;
        }
      }

      // 4. Load investigation into game context
      dispatch({
        type: 'SET_INVESTIGATION',
        payload: investigation
      });

      console.log('✅ Game started successfully');
      toast.success('Investigation saved and game starting!');
      
      // Navigate to game with investigation ID
      navigate(`/game/${investigation.id}`);
      
    } catch (error) {
      console.error('💥 Error starting game:', error);
      toast.error(`Error: ${error.message}`);
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
