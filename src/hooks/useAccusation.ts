
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
      console.log('🎯 Accusation en cours...', { investigation: investigation.id, accused: accusedCharacterId });

      // Vérifier si l'accusation a déjà été faite
      if (investigation.accusation_made) {
        toast.error('Une accusation a déjà été faite pour cette enquête');
        return { success: false, result: 'ongoing' };
      }

      // Déterminer si l'accusation est correcte
      const culprit = investigation.characters.find(char => char.is_culprit);
      const isCorrect = culprit?.id === accusedCharacterId;
      const result: GameResult = isCorrect ? 'won' : 'lost';

      console.log('🕵️ Résultat accusation:', { 
        culprit: culprit?.name, 
        accused: investigation.characters.find(c => c.id === accusedCharacterId)?.name,
        isCorrect,
        result 
      });

      // Mettre à jour l'investigation en base
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
        console.error('💥 Erreur sauvegarde accusation:', error);
        throw error;
      }

      // Afficher le résultat
      if (isCorrect) {
        toast.success('🎉 Félicitations ! Vous avez trouvé le coupable !', {
          description: `${culprit?.name} était bien le coupable. Enquête résolue !`,
          duration: 5000
        });
      } else {
        toast.error('❌ Mauvaise accusation !', {
          description: `${culprit?.name} était le vrai coupable. Enquête échouée.`,
          duration: 5000
        });
      }

      return { success: true, result };
    } catch (error) {
      console.error('💥 Erreur lors de l\'accusation:', error);
      toast.error('Erreur lors de l\'accusation');
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
