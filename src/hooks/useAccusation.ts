
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
        toast.error('Une accusation a déjà été faite pour cette enquête');
        return { success: false, result: 'ongoing' };
      }

      // Récupérer les informations du coupable depuis la base de données
      const { data: investigationData, error: fetchError } = await supabase
        .from('investigations')
        .select(`
          *,
          characters!characters_investigation_id_fkey(*)
        `)
        .eq('id', investigation.id)
        .single();

      if (fetchError) {
        console.error('💥 Erreur récupération enquête:', fetchError);
        throw fetchError;
      }

      // Trouver le vrai coupable et le personnage accusé
      const culprit = investigationData.characters.find((char: any) => char.is_culprit === true);
      const accusedCharacter = investigationData.characters.find((char: any) => char.id === accusedCharacterId);
      
      console.log('🔍 Détails de l\'accusation:', { 
        culprit: culprit ? { id: culprit.id, name: culprit.name, is_culprit: culprit.is_culprit } : 'NON TROUVÉ',
        accused: accusedCharacter ? { id: accusedCharacter.id, name: accusedCharacter.name } : 'NON TROUVÉ',
        culpritFromDb: investigationData.culprit_character_id,
        allCharacters: investigationData.characters.map((c: any) => ({ id: c.id, name: c.name, is_culprit: c.is_culprit }))
      });

      if (!accusedCharacter) {
        console.error('💥 Personnage accusé non trouvé');
        toast.error('Erreur: Personnage non trouvé');
        return { success: false, result: 'ongoing' };
      }

      // Déterminer si l'accusation est correcte
      const isCorrect = culprit && culprit.id === accusedCharacterId;
      const result: GameResult = isCorrect ? 'won' : 'lost';

      console.log('⚖️ Résultat de l\'accusation:', { 
        culpritName: culprit?.name || 'AUCUN COUPABLE TROUVÉ', 
        accusedName: accusedCharacter.name,
        isCorrect,
        result 
      });

      // Mettre à jour l'enquête dans la base de données
      const { error } = await supabase
        .from('investigations')
        .update({
          accused_character_id: accusedCharacterId,
          accusation_made: true,
          game_result: result,
          accusation_timestamp: new Date().toISOString(),
          culprit_character_id: culprit?.id || investigationData.culprit_character_id
        })
        .eq('id', investigation.id);

      if (error) {
        console.error('💥 Erreur sauvegarde accusation:', error);
        throw error;
      }

      // Afficher le résultat avec les noms
      if (isCorrect) {
        toast.success('🎉 Félicitations ! Vous avez trouvé le coupable !', {
          description: `${culprit?.name} était bien le coupable. Enquête résolue !`,
          duration: 5000
        });
      } else {
        const culpritMessage = culprit 
          ? `Le vrai coupable était ${culprit.name}.` 
          : 'Le vrai coupable n\'a pas été identifié dans l\'enquête.';
        
        toast.error('❌ Mauvaise accusation !', {
          description: `Vous avez accusé ${accusedCharacter.name}, mais ${culpritMessage} Enquête échouée.`,
          duration: 5000
        });
      }

      return { success: true, result };
    } catch (error) {
      console.error('💥 Erreur lors de l\'accusation:', error);
      
      if (error.message && error.message.includes('temporarily')) {
        toast.error('Service temporairement indisponible. Veuillez réessayer dans un moment.');
      } else {
        toast.error('Erreur lors de l\'accusation');
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
