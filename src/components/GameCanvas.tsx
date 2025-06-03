import React, { useEffect, useRef } from 'react';
import { GameManager } from '../phaser/Game';
import { Character } from '../types';
import { assetManager } from '../utils/assetManager';
import { useGame } from '../context/GameContext';

interface GameCanvasProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ characters, onCharacterClick }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const { state } = useGame();

  useEffect(() => {
    if (gameRef.current && !gameInstanceRef.current) {
      const gameManager = GameManager.getInstance();
      gameInstanceRef.current = gameManager.init(gameRef.current.id);

      // Configuration du handler de clic
      const scene = gameInstanceRef.current.scene.getScene('MainScene');
      if (scene && typeof (scene as any).setCharacterClickHandler === 'function') {
        (scene as any).setCharacterClickHandler(onCharacterClick);
      }
    }

    return () => {
      // Pas de cleanup automatique - on garde l'instance
    };
  }, [onCharacterClick]);

  useEffect(() => {
    if (gameInstanceRef.current && characters.length > 0) {
      console.log('Mise à jour des personnages dans GameCanvas:', characters);
      
      const scene = gameInstanceRef.current.scene.getScene('MainScene');
      if (scene && typeof (scene as any).setCharacters === 'function') {
        (scene as any).setCharacters(characters);
      }
    }
  }, [characters]);

  // Surveiller les changements d'assets et recharger automatiquement (sauf en mode démo)
  useEffect(() => {
    // Si ce n'est PAS le mode démo, configurer le rechargement automatique
    if (state.currentInvestigation?.id !== 'demo-investigation-001') {
      console.log('🔄 GameCanvas: Rechargement automatique des assets activé.');

      const reloadAssetsWhenAvailable = () => {
        const assets = assetManager.getAllAssets();
        console.log('Assets disponibles pour rechargement:', assets);
        
        if (assets.length > 0 && gameInstanceRef.current) {
          const scene = gameInstanceRef.current.scene.getScene('MainScene');
          if (scene && typeof (scene as any).reloadAssets === 'function') {
            console.log('Rechargement des assets dans la scène...');
            (scene as any).reloadAssets();
          }
        }
      };

      // Vérifier immédiatement
      reloadAssetsWhenAvailable();

      // Puis vérifier périodiquement (toutes les 3 secondes)
      const checkInterval = setInterval(reloadAssetsWhenAvailable, 3000);

      return () => clearInterval(checkInterval);
    } else {
      // En mode démo, afficher un message et ne rien faire
      console.log('🚫 GameCanvas: Rechargement automatique des assets désactivé en mode démo.');
    }

    // Cleanup pour le cas démo (bien que rien ne soit configuré)
    return () => {};

  }, [state.currentInvestigation]); // Dépendance à state.currentInvestigation

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
      <div 
        ref={gameRef} 
        id="game-container"
        className="w-[800px] h-[600px] border border-slate-500 rounded bg-slate-900"
        style={{ 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' 
        }}
      />
    </div>
  );
};

export default GameCanvas;
