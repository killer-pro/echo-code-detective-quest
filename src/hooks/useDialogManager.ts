
import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Character, DialogEntry } from '../types';
import { geminiAPI } from '../api/gemini';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { DemoService } from '../utils/demoService';
import { useClueDetection } from './useClueDetection';

export const useDialogManager = () => {
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const { detectAndSaveClue } = useClueDetection();

  const loadDialogHistory = async () => {
    if (!state.currentInvestigation) return;

    if (state.currentInvestigation.id === 'demo-investigation-001') {
      console.log('📖 useDialogManager: Chargement des dialogues de démo...');
      const demoDialogs = DemoService.getDemoDialogs();
      demoDialogs.forEach(dialog => {
        dispatch({ type: 'ADD_DIALOG', payload: dialog });
      });
      console.log(`✅ ${demoDialogs.length} dialogues de démo chargés`);
      return;
    }

    try {
      console.log('📖 useDialogManager: Chargement depuis dialog_history...');
      const { data: dialogData, error } = await supabase
        .from('dialog_history')
        .select('*')
        .eq('investigation_id', state.currentInvestigation.id)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('💥 Erreur lors du chargement dialog_history:', error);
        throw error;
      }

      if (dialogData && dialogData.length > 0) {
        console.log(`📚 Chargement de ${dialogData.length} dialogues depuis dialog_history`);
        
        dialogData.forEach(dialog => {
          const keywords: string[] = [];
          try {
            const keywordData = dialog.clickable_keywords;
            if (Array.isArray(keywordData)) {
              keywordData.forEach((item: unknown) => {
                if (typeof item === 'string') {
                  keywords.push(item);
                }
              });
            }
          } catch (error) {
            console.warn('⚠️ Erreur lors de la conversion des keywords:', error);
          }

          const dialogEntry: DialogEntry = {
            id: dialog.id,
            character_id: dialog.character_id || '',
            user_input: dialog.user_input,
            character_reply: dialog.character_reply,
            timestamp: dialog.timestamp || new Date().toISOString(),
            clickable_keywords: keywords,
            reputation_impact: dialog.reputation_impact || 0,
            truth_likelihood: dialog.truth_likelihood || 0.5,
          };
          dispatch({ type: 'ADD_DIALOG', payload: dialogEntry });
        });
        
        console.log(`✅ ${dialogData.length} dialogues chargés avec succès`);
      } else {
        console.log('📭 Aucun dialogue trouvé dans l\'historique');
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement de l\'historique:', error);
    }
  };

  const saveDialogToDatabase = async (dialog: DialogEntry) => {
    if (!state.currentInvestigation) return;

    if (state.currentInvestigation.id === 'demo-investigation-001') {
      console.log('💾 useDialogManager: Pas de sauvegarde en mode démo');
      return;
    }

    try {
      console.log('💾 Sauvegarde dialogue dans dialog_history...');
      const { error } = await supabase
        .from('dialog_history')
        .insert({
          investigation_id: state.currentInvestigation.id,
          character_id: dialog.character_id,
          user_input: dialog.user_input,
          character_reply: dialog.character_reply,
          timestamp: dialog.timestamp,
          clickable_keywords: dialog.clickable_keywords,
          reputation_impact: dialog.reputation_impact,
          truth_likelihood: dialog.truth_likelihood,
        });

      if (error) {
        console.error('💥 Erreur sauvegarde dialogue:', error);
        throw error;
      }
      console.log('✅ Dialogue sauvegardé dans dialog_history');
    } catch (error) {
      console.error('💥 Erreur lors de la sauvegarde du dialogue:', error);
      toast.error('Erreur lors de la sauvegarde du dialogue');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!state.activeCharacter || !state.currentInvestigation) {
      console.warn('⚠️ Pas de personnage actif ou d\'investigation');
      return;
    }

    console.log('💬 Envoi message à:', state.activeCharacter.name, '- Message:', message);
    setIsLoading(true);
    
    try {
      const characterHistory = state.dialogHistory
        .filter(d => d.character_id === state.activeCharacter!.id)
        .map(d => `Vous: ${d.user_input}\n${state.activeCharacter!.name}: ${d.character_reply}`)
        .slice(-5);

      console.log('📚 Historique du personnage:', characterHistory.length, 'entrées');

      console.log('🤖 Appel API Gemini...');
      const response = await geminiAPI.generateCharacterResponse(
        state.activeCharacter.name,
        state.activeCharacter.role,
        state.activeCharacter.personality,
        state.activeCharacter.knowledge,
        state.reputation[state.activeCharacter.id] || 50,
        message,
        characterHistory
      );

      console.log('✅ Réponse Gemini reçue:', response);

      const dialogEntry: DialogEntry = {
        id: `dialog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        character_id: state.activeCharacter.id,
        user_input: message,
        character_reply: response.text,
        timestamp: new Date().toISOString(),
        clickable_keywords: response.keywords,
        reputation_impact: response.reputationImpact,
        truth_likelihood: response.truthLikelihood,
      };

      dispatch({ type: 'ADD_DIALOG', payload: dialogEntry });
      await saveDialogToDatabase(dialogEntry);
      
      if (response.reputationImpact !== 0) {
        console.log('📊 Impact réputation:', response.reputationImpact);
        dispatch({ 
          type: 'UPDATE_CHARACTER_REPUTATION', 
          payload: { 
            characterId: state.activeCharacter.id, 
            change: response.reputationImpact 
          }
        });
      }

      // Détecter et sauvegarder les indices automatiquement
      if (state.currentInvestigation.id !== 'demo-investigation-001') {
        await detectAndSaveClue(
          state.currentInvestigation.id,
          state.activeCharacter.id,
          dialogEntry.id,
          response.text,
          response.truthLikelihood
        );
      }

      if (response.truthLikelihood > 0.6 && Math.random() > 0.7) {
        const lead = {
          id: `lead_${Date.now()}`,
          investigation_id: state.currentInvestigation.id,
          description: `Information obtenue de ${state.activeCharacter.name}: ${response.text.substring(0, 100)}...`,
          source_pnj: state.activeCharacter.id,
          confidence_level: response.truthLikelihood,
          resolved: false,
          discovered_at: new Date().toLocaleString(),
        };
        
        console.log('🔍 Nouvel indice généré:', lead);
        dispatch({ type: 'ADD_LEAD', payload: lead });
      }

    } catch (error) {
      console.error('💥 Erreur lors de la génération de réponse:', error);
      
      const fallbackDialog: DialogEntry = {
        id: `dialog_${Date.now()}_fallback`,
        character_id: state.activeCharacter.id,
        user_input: message,
        character_reply: "Désolé, je ne peux pas vous répondre maintenant. Revenez me voir plus tard.",
        timestamp: new Date().toISOString(),
        clickable_keywords: [],
        reputation_impact: -1,
        truth_likelihood: 0.1,
      };
      
      dispatch({ type: 'ADD_DIALOG', payload: fallbackDialog });
      await saveDialogToDatabase(fallbackDialog);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadDialogHistory,
    handleSendMessage,
  };
};
