
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Investigation, GameResult } from '../types';
import { toast } from 'sonner';

export const useAccusation = () => {
  const [isAccusing, setIsAccusing] = useState(false);

  const makeAccusation = async (
    investigation: Investigation,
    accusedCharacterId: string
  ): Promise<{ success: boolean; result: GameResult }> => {
    setIsAccusing(true);
    
    try {
      console.log('🎯 Making accusation...', { investigation: investigation.id, accused: accusedCharacterId });

      if (investigation.accusation_made) {
        toast.error('An accusation has already been made for this investigation');
        return { success: false, result: 'ongoing' };
      }

      // Find the real culprit and the accused character
      const culprit = investigation.characters.find(char => char.is_culprit === true);
      const accusedCharacter = investigation.characters.find(char => char.id === accusedCharacterId);
      
      console.log('🔍 Accusation details:', { 
        culprit: culprit ? { id: culprit.id, name: culprit.name, is_culprit: culprit.is_culprit } : 'NOT FOUND',
        accused: accusedCharacter ? { id: accusedCharacter.id, name: accusedCharacter.name } : 'NOT FOUND',
        allCharacters: investigation.characters.map(c => ({ id: c.id, name: c.name, is_culprit: c.is_culprit }))
      });

      if (!accusedCharacter) {
        console.error('💥 Accused character not found');
        toast.error('Error: Character not found');
        return { success: false, result: 'ongoing' };
      }

      // Determine if the accusation is correct
      const isCorrect = culprit && culprit.id === accusedCharacterId;
      const result: GameResult = isCorrect ? 'won' : 'lost';

      console.log('⚖️ Accusation result:', { 
        culpritName: culprit?.name || 'NO CULPRIT FOUND', 
        accusedName: accusedCharacter.name,
        isCorrect,
        result 
      });

      // Update the investigation in database
      const { error } = await supabase
        .from('investigations')
        .update({
          accused_character_id: accusedCharacterId,
          accusation_made: true,
          game_result: result,
          accusation_timestamp: new Date().toISOString()
        })
        .eq('id', investigation.id);

      if (error) {
        console.error('💥 Error saving accusation:', error);
        throw error;
      }

      // Show the result
      if (isCorrect) {
        toast.success('🎉 Congratulations! You found the culprit!', {
          description: `${culprit.name} was indeed the culprit. Investigation solved!`,
          duration: 5000
        });
      } else {
        const culpritMessage = culprit 
          ? `${culprit.name} was the real culprit.` 
          : 'The real culprit was not identified in the investigation.';
        
        toast.error('❌ Wrong accusation!', {
          description: `You accused ${accusedCharacter.name}, but ${culpritMessage} Investigation failed.`,
          duration: 5000
        });
      }

      return { success: true, result };
    } catch (error) {
      console.error('💥 Error during accusation:', error);
      
      if (error.message && error.message.includes('temporarily')) {
        toast.error('Service temporarily unavailable. Please try again in a moment.');
      } else {
        toast.error('Error during accusation');
      }
      
      return { success: false, result: 'ongoing' };
    } finally {
      setIsAccusing(false);
    }
  };

  return {
    makeAccusation,
    isAccusing
  };
};
