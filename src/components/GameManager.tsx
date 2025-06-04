import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Character } from '../types';
import { useAssetManager } from '../hooks/useAssetManager';
import { useDialogManager } from '../hooks/useDialogManager';
import { DemoService } from '../utils/demoService';
import { assetManager } from '../utils/assetManager';

interface GameManagerProps {
  children: (props: {
    isLoading: boolean;
    assetsInitialized: boolean;
    handleCharacterClick: (character: Character) => void;
    handleSendMessage: (message: string) => Promise<void>;
    error?: string;
  }) => React.ReactNode;
}

const GameManager: React.FC<GameManagerProps> = ({ children }) => {
  const { state, dispatch } = useGame();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>();

  // Hooks pour la gestion des assets et dialogues
  const { assetsInitialized, initializeAssets } = useAssetManager(state.currentInvestigation?.id || null);
  const { isLoading, loadDialogHistory, handleSendMessage } = useDialogManager();

  // Initialisation de l'enquête
  useEffect(() => {
    const initializeInvestigation = async () => {
      if (!state.currentInvestigation || isInitialized) {
        return;
      }

      console.log('🎮 GameManager: Initialisation de l\'enquête:', state.currentInvestigation.title);
      setError(undefined);

      try {
        // 1. Initialiser les assets via useAssetManager (gère démo ou DB)
        console.log('🎮 GameManager: Initialisation des assets via useAssetManager...');
        await initializeAssets(); // initializeAssets gère maintenant la logique démo/DB

        // 2. Charger l'historique des dialogues
        console.log('📖 GameManager: Chargement de l\'historique des dialogues...');
        await loadDialogHistory(); // loadDialogHistory gère maintenant la logique démo/DB

        // 3. Initialiser les réputations des personnages
        state.currentInvestigation.characters.forEach(character => {
          if (!state.reputation[character.id]) {
            dispatch({
              type: 'UPDATE_CHARACTER_REPUTATION',
              payload: { characterId: character.id, change: character.reputation_score }
            });
          }
        });

        setIsInitialized(true);
        console.log('✅ GameManager: Enquête initialisée avec succès');

      } catch (error) {
        console.error('💥 GameManager: Erreur lors de l\'initialisation:', error);
        setError('Erreur lors du chargement de l\'enquête');
      }
    };

    initializeInvestigation();
  }, [state.currentInvestigation, isInitialized, dispatch, initializeAssets, loadDialogHistory, state.reputation]);

  // Gestion du clic sur un personnage
  const handleCharacterClick = useCallback((character: Character) => {
    console.log('🖱️ GameManager: Clic sur personnage:', character.name);

    // Vérifier si le personnage est déjà actif
    if (state.activeCharacter?.id === character.id) {
      console.log('🖱️ GameManager: Personnage déjà actif');
      return;
    }

    // Activer le personnage
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: character });

    // Mettre à jour l'état d'alerte si nécessaire
    if (!character.alerted) {
      dispatch({
        type: 'UPDATE_CHARACTER_ALERTED_STATUS',
        payload: {
          characterId: character.id,
          alerted: true
        }
      });
    }

    console.log('✅ GameManager: Personnage activé:', character.name);
  }, [state.activeCharacter, dispatch]);

  // Wrapper pour l'envoi de messages avec gestion d'erreur
  const handleSendMessageWrapper = useCallback(async (message: string) => {
    try {
      await handleSendMessage(message);
    } catch (error) {
      console.error('💥 GameManager: Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  }, [handleSendMessage]);

  // Déterminer l'état de chargement global
  const globalLoading = !isInitialized || isLoading;
  const globalAssetsReady = isInitialized && (assetsInitialized || assetManager.isAssetManagerReady());

  return (
      <>
        {children({
          isLoading: globalLoading,
          assetsInitialized: globalAssetsReady,
          handleCharacterClick,
          handleSendMessage: handleSendMessageWrapper,
          error
        })}
      </>
  );
};

export default GameManager;