
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { supabase } from '../integrations/supabase/client';
import { convertSupabaseInvestigation } from '../types';
import DialogueBox from '../components/DialogueBox';
import Journal from '../components/Journal';
import GameManager from '../components/GameManager';
import GameSaveManager from '../components/GameSaveManager';
import GameUI from '../components/game/GameUI';
import GameCanvas from '../components/game/GameCanvas';
import DialogueOverlay from '../components/game/DialogueOverlay';
import AccusationModal from '../components/game/AccusationModal';
import { Character } from '../types';
import { GameSaveService } from '../utils/gameSaveService';
import { useAccusation } from '../hooks/useAccusation';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const { investigationId } = useParams<{ investigationId: string }>();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const { makeAccusation, isAccusing } = useAccusation();

  // Charger l'investigation si un ID est fourni
  useEffect(() => {
    if (investigationId && (!state.currentInvestigation || state.currentInvestigation.id !== investigationId)) {
      loadInvestigation(investigationId);
    }
  }, [investigationId]);

  const loadInvestigation = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('📖 Chargement de l\'investigation:', id);
      
      const { data, error } = await supabase
        .from('investigations')
        .select(`
          *,
          characters(*),
          clues(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('💥 Erreur chargement investigation:', error);
        
        // Si l'investigation n'est pas trouvée, rediriger vers l'accueil
        if (error.code === 'PGRST116') {
          console.log('Investigation non trouvée, redirection vers l\'accueil');
          navigate('/');
          return;
        }
        
        throw error;
      }

      if (!data) {
        console.error('💥 Aucune donnée retournée pour l\'investigation:', id);
        navigate('/');
        return;
      }

      const investigation = convertSupabaseInvestigation(data);
      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });
      
      console.log('✅ Investigation chargée:', investigation.title);
    } catch (error) {
      console.error('💥 Erreur:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLoadGame = (saveData: any) => {
    if (saveData.game_state) {
      dispatch({
        type: 'LOAD_GAME_STATE',
        payload: {
          dialogHistory: saveData.game_state.dialogHistory || [],
          discoveredLeads: saveData.game_state.discoveredLeads || [],
          reputation: saveData.game_state.reputation || {},
          playerPosition: saveData.player_position || { x: 400, y: 300 },
          charactersAlerted: saveData.game_state.charactersAlerted || {}
        }
      });
      
      setIsMenuOpen(false);
      toast.success('Partie chargée avec succès !');
    }
  };

  const handleAccusation = async (characterId: string) => {
    if (!state.currentInvestigation) return;

    const result = await makeAccusation(state.currentInvestigation, characterId);
    
    if (result.success) {
      // Mettre à jour l'état local
      const updatedInvestigation = {
        ...state.currentInvestigation,
        accused_character_id: characterId,
        accusation_made: true,
        game_result: result.result,
        accusation_timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'SET_INVESTIGATION', payload: updatedInvestigation });
      setShowAccusationModal(false);
    }
  };

  const playerStats = {
    dialogCount: state.dialogHistory.length,
    leadsCount: state.discoveredLeads.length,
    alertedCharacters: state.currentInvestigation?.characters.filter(c => c.alerted).length || 0,
    totalCharacters: state.currentInvestigation?.characters.length || 0
  };

  // Vérifier si l'enquête est terminée
  const isGameFinished = state.currentInvestigation?.accusation_made || false;
  const gameResult = state.currentInvestigation?.game_result || 'ongoing';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Chargement de l'enquête...</h1>
        </div>
      </div>
    );
  }

  if (!state.currentInvestigation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Aucune enquête active</h1>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameManager>
      {({ isLoading: gameLoading, assetsInitialized, handleCharacterClick, handleSendMessage, error }) => (
        <div className="min-h-screen bg-slate-900 overflow-hidden">
          <GameUI
            investigation={state.currentInvestigation}
            assetsInitialized={assetsInitialized}
            onNavigateHome={() => navigate('/')}
            onToggleJournal={() => {
              setIsJournalOpen(!isJournalOpen);
              setIsDialogueOpen(false);
              setIsMenuOpen(false);
            }}
            onToggleMenu={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsDialogueOpen(false);
              setIsJournalOpen(false);
            }}
            onSaveGame={handleSaveGame}
            onShowAccusation={() => setShowAccusationModal(true)}
            isSaving={isSaving}
            isJournalOpen={isJournalOpen}
            isMenuOpen={isMenuOpen}
            playerStats={playerStats}
            isGameFinished={isGameFinished}
            gameResult={gameResult}
          />

          {/* Layout principal */}
          <div className="flex h-[calc(100vh-140px)] relative">
            {/* Zone de jeu */}
            {assetsInitialized ? (
              <GameCanvas
                characters={state.currentInvestigation.characters}
                onCharacterClick={(character: Character) => {
                  if (isGameFinished) {
                    toast.info('L\'enquête est terminée. Impossible d\'interagir.');
                    return;
                  }
                  handleCharacterClick(character);
                  setIsDialogueOpen(true);
                  setIsJournalOpen(false);
                  setIsMenuOpen(false);
                }}
                backgroundUrl={state.currentInvestigation.background_url}
                isDialogueOpen={isDialogueOpen}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-white text-center">
                <div>
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-lg mb-2">Génération des assets...</p>
                  <p className="text-sm text-gray-400">
                    Création des personnages et arrière-plans avec IA
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Modal d'accusation */}
            {showAccusationModal && !isGameFinished && (
              <AccusationModal
                investigation={state.currentInvestigation}
                characters={state.currentInvestigation.characters}
                onAccuse={handleAccusation}
                onCancel={() => setShowAccusationModal(false)}
                isLoading={isAccusing}
              />
            )}

            {/* Overlay de dialogue immersif */}
            {state.activeCharacter && (
              <DialogueOverlay
                character={state.activeCharacter}
                isVisible={isDialogueOpen}
                onClose={closeDialogue}
              />
            )}

            {/* Panneau latéral pour journal et menu */}
            {(isJournalOpen || isMenuOpen) && !isDialogueOpen && (
              <div className="absolute top-0 right-0 w-1/3 min-w-[400px] h-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 shadow-2xl z-40 overflow-hidden">
                {isJournalOpen && (
                  <div className="h-full p-4">
                    <Journal
                      dialogHistory={state.dialogHistory}
                      discoveredLeads={state.discoveredLeads}
                      characters={state.currentInvestigation.characters}
                      investigation={state.currentInvestigation}
                    />
                  </div>
                )}

                {isMenuOpen && (
                  <div className="h-full p-4 overflow-y-auto">
                    <GameSaveManager onLoadGame={handleLoadGame} />
                  </div>
                )}
              </div>
            )}

            {/* DialogueBox intégré dans l'overlay pour le mode dialogue */}
            {isDialogueOpen && state.activeCharacter && !isGameFinished && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50 px-4">
                <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-white/20">
                  <DialogueBox
                    character={state.activeCharacter}
                    dialogHistory={state.dialogHistory}
                    onSendMessage={handleSendMessage}
                    onClose={closeDialogue}
                    isLoading={gameLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </GameManager>
  );
};

export default Game;
