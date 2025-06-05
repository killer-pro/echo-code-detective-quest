
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

  // Load investigation if ID is provided
  useEffect(() => {
    if (investigationId && (!state.currentInvestigation || state.currentInvestigation.id !== investigationId)) {
      loadInvestigation(investigationId);
    }
  }, [investigationId]);

  const loadInvestigation = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('📖 Loading investigation:', id);
      
      const { data, error } = await supabase
        .from('investigations')
        .select(`
          *,
          characters!characters_investigation_id_fkey(*),
          clues(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('💥 Error loading investigation:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Investigation not found, redirecting to home');
          navigate('/');
          return;
        }
        
        throw error;
      }

      if (!data) {
        console.error('💥 No data returned for investigation:', id);
        navigate('/');
        return;
      }

      const investigation = convertSupabaseInvestigation(data);
      
      // Add default player image if not defined
      if (!investigation.player_image_url) {
        investigation.player_image_url = 'https://res.cloudinary.com/dyvgd3xak/image/upload/v1748974162/bb1ac672-1096-498c-9287-dd7626326b26/character/D%C3%A9tective_1748974160161.jpg';
      }
      
      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });
      
      console.log('✅ Investigation loaded:', investigation.title);
    } catch (error) {
      console.error('💥 Error:', error);
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
      toast.error('No investigation in progress');
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

      toast.success('Game saved successfully!', {
        description: 'You can resume your investigation later.'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving game');
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
      toast.success('Game loaded successfully!');
    }
  };

  const handleAccusation = async (characterId: string) => {
    if (!state.currentInvestigation) return;

    const result = await makeAccusation(state.currentInvestigation, characterId);
    
    if (result.success) {
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

  const isGameFinished = state.currentInvestigation?.accusation_made || false;
  const gameResult = state.currentInvestigation?.game_result || 'ongoing';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Loading investigation...</h1>
        </div>
      </div>
    );
  }

  if (!state.currentInvestigation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">No active investigation</h1>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base"
          >
            Back to home
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

          {/* Main layout */}
          <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] relative">
            {/* Game area */}
            {assetsInitialized ? (
              <GameCanvas
                characters={state.currentInvestigation.characters}
                onCharacterClick={(character: Character) => {
                  if (isGameFinished) {
                    toast.info('Investigation is complete. Cannot interact.');
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
              <div className="flex-1 flex items-center justify-center text-white text-center p-4">
                <div>
                  <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-base md:text-lg mb-2">Generating assets...</p>
                  <p className="text-xs md:text-sm text-gray-400">
                    Creating characters and backgrounds with AI
                  </p>
                  {error && (
                    <p className="text-red-400 text-xs md:text-sm mt-2">{error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Accusation modal */}
            {showAccusationModal && !isGameFinished && (
              <AccusationModal
                investigation={state.currentInvestigation}
                characters={state.currentInvestigation.characters}
                onAccuse={handleAccusation}
                onCancel={() => setShowAccusationModal(false)}
                isLoading={isAccusing}
              />
            )}

            {/* Immersive dialogue overlay */}
            {state.activeCharacter && (
              <DialogueOverlay
                character={state.activeCharacter}
                isVisible={isDialogueOpen}
                onClose={closeDialogue}
              />
            )}

            {/* Side panel for journal and menu */}
            {(isJournalOpen || isMenuOpen) && !isDialogueOpen && (
              <div className="absolute top-0 right-0 w-full md:w-1/3 md:min-w-[400px] h-full bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-700 shadow-2xl z-40 overflow-hidden">
                {isJournalOpen && (
                  <div className="h-full p-2 md:p-4">
                    <Journal
                      dialogHistory={state.dialogHistory}
                      discoveredLeads={state.discoveredLeads}
                      characters={state.currentInvestigation.characters}
                      investigation={state.currentInvestigation}
                    />
                  </div>
                )}

                {isMenuOpen && (
                  <div className="h-full p-2 md:p-4 overflow-y-auto">
                    <GameSaveManager onLoadGame={handleLoadGame} />
                  </div>
                )}
              </div>
            )}

            {/* DialogueBox integrated in overlay for dialogue mode */}
            {isDialogueOpen && state.activeCharacter && !isGameFinished && (
              <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs md:max-w-4xl z-50 px-2 md:px-4">
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
