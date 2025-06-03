
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import KonvaGameCanvas from '../components/KonvaGameCanvas';
import DialogueBox from '../components/DialogueBox';
import Journal from '../components/Journal';
import GameManager from '../components/GameManager';
import { Button } from '../components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Character } from '../types';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const closeDialogue = () => {
    setIsDialogueOpen(false);
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: null });
  };

  if (!state.currentInvestigation) {
    console.warn('⚠️ Game: Aucune enquête active, redirection vers accueil');
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

  console.log('🎮 Game: Rendu avec investigation:', state.currentInvestigation.title);

  return (
    <GameManager>
      {({ isLoading, assetsInitialized, handleCharacterClick, handleSendMessage }) => (
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
                  <p className="text-gray-400 text-sm">
                    {assetsInitialized ? 'Enquête en cours' : 'Chargement...'}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setIsJournalOpen(!isJournalOpen);
                  if (isDialogueOpen) setIsDialogueOpen(false);
                }}
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
              {assetsInitialized ? (
                <KonvaGameCanvas
                  characters={state.currentInvestigation.characters}
                  onCharacterClick={(character: Character) => {
                    console.log('🖱️ Game.tsx: onCharacterClick called for:', character.name);
                    handleCharacterClick(character);
                    setIsDialogueOpen(true);
                    setIsJournalOpen(false);
                    console.log('🖱️ Game.tsx: Setting isDialogueOpen to true.');
                  }}
                />
              ) : (
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Chargement des assets...</p>
                  <p className="text-sm text-gray-400">Initialisation de l'enquête en cours</p>
                </div>
              )}
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
                      investigation={state.currentInvestigation}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions en bas */}
          <div className="bg-slate-800 border-t border-slate-700 p-2">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
              Utilisez les flèches du clavier pour vous déplacer • Cliquez sur un personnage ou approchez-vous et appuyez sur ESPACE pour interagir
            </div>
          </div>
        </div>
      )}
    </GameManager>
  );
};

export default Game;
