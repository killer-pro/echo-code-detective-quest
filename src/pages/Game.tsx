
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GameCanvas from '../components/GameCanvas';
import DialogueBox from '../components/DialogueBox';
import Journal from '../components/Journal';
import { Character, DialogEntry } from '../types';
import { geminiAPI } from '../api/gemini';
import { Button } from '../components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCharacterClick = (character: Character) => {
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: character });
    setIsDialogueOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!state.activeCharacter || !state.currentInvestigation) return;

    setIsLoading(true);
    
    try {
      // Récupère l'historique des conversations avec ce personnage
      const characterHistory = state.dialogHistory
        .filter(d => d.character_id === state.activeCharacter!.id)
        .map(d => `Vous: ${d.user_input}\n${state.activeCharacter!.name}: ${d.character_reply}`)
        .slice(-5); // Garde seulement les 5 dernières interactions

      // Appel à l'API Gemini
      const response = await geminiAPI.generateCharacterResponse(
        state.activeCharacter.name,
        state.activeCharacter.role,
        state.activeCharacter.personality,
        state.activeCharacter.knowledge,
        state.reputation[state.activeCharacter.id] || 50,
        message,
        characterHistory
      );

      // Crée l'entrée de dialogue
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

      // Met à jour l'état global
      dispatch({ type: 'ADD_DIALOG', payload: dialogEntry });
      
      if (response.reputationImpact !== 0) {
        dispatch({ 
          type: 'UPDATE_CHARACTER_REPUTATION', 
          payload: { 
            characterId: state.activeCharacter.id, 
            change: response.reputationImpact 
          }
        });
      }

      // Génère potentiellement de nouveaux indices
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
        
        dispatch({ type: 'ADD_LEAD', payload: lead });
      }

    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      
      // Réponse de fallback en cas d'erreur
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
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialogue = () => {
    setIsDialogueOpen(false);
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: null });
  };

  if (!state.currentInvestigation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Aucune enquête active</h1>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{state.currentInvestigation.title}</h1>
              <p className="text-gray-400 text-sm">Enquête en cours</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsJournalOpen(!isJournalOpen)}
            variant={isJournalOpen ? "default" : "outline"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Book className="w-4 h-4 mr-2" />
            Journal
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Zone de jeu */}
        <div className="flex-1 flex items-center justify-center p-4">
          <GameCanvas
            characters={state.currentInvestigation.characters}
            onCharacterClick={handleCharacterClick}
          />
        </div>

        {/* Panneau latéral */}
        {(isDialogueOpen || isJournalOpen) && (
          <div className="w-1/3 min-w-[400px] border-l border-slate-700 bg-slate-800 overflow-hidden">
            {isDialogueOpen && state.activeCharacter && (
              <div className="h-full p-4">
                <DialogueBox
                  character={state.activeCharacter}
                  dialogHistory={state.dialogHistory}
                  onSendMessage={handleSendMessage}
                  onClose={closeDialogue}
                  isLoading={isLoading}
                />
              </div>
            )}
            
            {isJournalOpen && !isDialogueOpen && (
              <div className="h-full p-4">
                <Journal
                  dialogHistory={state.dialogHistory}
                  discoveredLeads={state.discoveredLeads}
                  characters={state.currentInvestigation.characters}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions en bas */}
      <div className="bg-slate-800 border-t border-slate-700 p-2">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          Utilisez les flèches du clavier pour vous déplacer • Cliquez sur un personnage pour interagir
        </div>
      </div>
    </div>
  );
};

export default Game;
