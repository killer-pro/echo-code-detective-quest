
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import KonvaGameCanvas from '../components/KonvaGameCanvas';
import DialogueBox from '../components/DialogueBox';
import Journal from '../components/Journal';
import GameManager from '../components/GameManager';
import { Button } from '../components/ui/button';
import { ArrowLeft, Book, Save, Menu, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Character } from '../types';
import { GameSaveService } from '../utils/gameSaveService';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const closeDialogue = () => {
    setIsDialogueOpen(false);
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: null });
  };

  const handleSaveGame = async () => {
    if (!state.currentInvestigation) {
      toast.error('Aucune enquête en cours');
      return;
    }

    setIsSaving(true);
    try {
      const charactersAlerted = state.currentInvestigation.characters.reduce((acc, char) => {
        acc[char.id] = char.alerted || false;
        return acc;
      }, {} as { [characterId: string]: boolean });

      await GameSaveService.saveGame(
        state.currentInvestigation,
        state.playerPosition,
        state.dialogHistory,
        state.discoveredLeads,
        state.reputation,
        charactersAlerted
      );

      toast.success('Partie sauvegardée avec succès !', {
        description: 'Vous pouvez reprendre votre enquête plus tard.'
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
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
      {({ isLoading, assetsInitialized, handleCharacterClick, handleSendMessage, error }) => (
        <div className="min-h-screen bg-slate-900">
          {/* Header amélioré */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-4 shadow-lg">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-gray-300 hover:text-white hover:bg-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <div className="border-l border-slate-600 pl-4">
                  <h1 className="text-xl font-bold text-white">{state.currentInvestigation.title}</h1>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${assetsInitialized ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    {assetsInitialized ? 'Enquête active' : 'Chargement des assets...'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Bouton Sauvegarde */}
                <Button
                  onClick={handleSaveGame}
                  disabled={isSaving}
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>

                {/* Bouton Journal */}
                <Button
                  onClick={() => {
                    setIsJournalOpen(!isJournalOpen);
                    if (isDialogueOpen) setIsDialogueOpen(false);
                    if (isMenuOpen) setIsMenuOpen(false);
                  }}
                  variant={isJournalOpen ? "default" : "outline"}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Journal
                </Button>

                {/* Menu */}
                <Button
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    if (isDialogueOpen) setIsDialogueOpen(false);
                    if (isJournalOpen) setIsJournalOpen(false);
                  }}
                  variant={isMenuOpen ? "default" : "outline"}
                  className="text-gray-300 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Layout principal */}
          <div className="flex h-[calc(100vh-80px)]">
            {/* Zone de jeu */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
              {assetsInitialized ? (
                <KonvaGameCanvas
                  characters={state.currentInvestigation.characters}
                  onCharacterClick={(character: Character) => {
                    console.log('🖱️ Game.tsx: onCharacterClick called for:', character.name);
                    handleCharacterClick(character);
                    setIsDialogueOpen(true);
                    setIsJournalOpen(false);
                    setIsMenuOpen(false);
                    console.log('🖱️ Game.tsx: Setting isDialogueOpen to true.');
                  }}
                />
              ) : (
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Génération des assets...</p>
                  <p className="text-sm text-gray-400">
                    Création des personnages et arrière-plans avec IA
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
              )}

              {/* Statistiques en overlay */}
              {assetsInitialized && (
                <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-white">
                  <div className="text-xs text-gray-300 mb-1">Progression</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>💬 {state.dialogHistory.length}</span>
                    <span>🕵️ {state.discoveredLeads.length}</span>
                    <span>👥 {state.currentInvestigation.characters.filter(c => c.alerted).length}/{state.currentInvestigation.characters.length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Panneau latéral */}
            {(isDialogueOpen || isJournalOpen || isMenuOpen) && (
              <div className="w-1/3 min-w-[400px] border-l border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
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

                {isMenuOpen && !isDialogueOpen && !isJournalOpen && (
                  <div className="h-full p-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <h3 className="text-white text-lg font-bold mb-4">Options</h3>
                      <div className="space-y-3">
                        <Button
                          onClick={handleSaveGame}
                          disabled={isSaving}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Sauvegarde...' : 'Sauvegarder la partie'}
                        </Button>
                        
                        <Button
                          onClick={() => navigate('/')}
                          variant="outline"
                          className="w-full"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Retour au menu principal
                        </Button>
                      </div>
                      
                      <div className="mt-6 p-3 bg-slate-700 rounded text-sm text-gray-300">
                        <p className="font-semibold mb-2">Contrôles :</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Flèches : Se déplacer</li>
                          <li>• ESPACE : Interagir avec un personnage proche</li>
                          <li>• Clic : Interagir avec un personnage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barre d'instructions améliorée */}
          <div className="bg-slate-800 border-t border-slate-700 p-2">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
              <span className="inline-flex items-center gap-4">
                <span>🎮 Utilisez les flèches pour vous déplacer</span>
                <span>•</span>
                <span>🤝 Approchez-vous des personnages et appuyez sur ESPACE</span>
                <span>•</span>
                <span>💾 N'oubliez pas de sauvegarder votre progression</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </GameManager>
  );
};

export default Game;
