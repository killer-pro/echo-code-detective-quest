
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
      console.log('🎮 GameCanvas: Initialisation du jeu Phaser');
      const gameManager = GameManager.getInstance();
      gameInstanceRef.current = gameManager.init(gameRef.current.id);

      // Attendre que la scène soit créée puis configurer les handlers
      gameInstanceRef.current.events.once('ready', () => {
        console.log('🎮 GameCanvas: Jeu Phaser prêt');
        const scene = gameInstanceRef.current?.scene.getScene('MainScene') as any;
        if (scene && typeof scene.setCharacterClickHandler === 'function') {
          scene.setCharacterClickHandler(onCharacterClick);
          console.log('🖱️ GameCanvas: Handler de clic configuré');
        }
      });
    }

    return () => {
      // Pas de cleanup automatique - on garde l'instance
    };
  }, [onCharacterClick]);

  // Mettre à jour les personnages dans la scène quand ils changent
  useEffect(() => {
    if (gameInstanceRef.current && characters.length > 0) {
      console.log('👥 GameCanvas: Mise à jour des personnages:', characters.length);
      
      const scene = gameInstanceRef.current.scene.getScene('MainScene') as any;
      if (scene && typeof scene.setCharacters === 'function') {
        scene.setCharacters(characters);
        console.log('✅ GameCanvas: Personnages mis à jour dans la scène');
      }
    }
  }, [characters]);

  // Surveiller les changements d'assets et recharger automatiquement (sauf en mode démo)
  useEffect(() => {
    if (state.currentInvestigation?.id !== 'demo-investigation-001') {
      console.log('🔄 GameCanvas: Surveillance des assets activée');

      const reloadAssetsWhenAvailable = () => {
        const assets = assetManager.getAllAssets();
        console.log('📦 GameCanvas: Assets disponibles:', assets.length);
        
        if (assets.length > 0 && gameInstanceRef.current) {
          const scene = gameInstanceRef.current.scene.getScene('MainScene') as any;
          if (scene && typeof scene.reloadAssets === 'function') {
            console.log('🔄 GameCanvas: Rechargement des assets dans la scène');
            scene.reloadAssets();
          }
        }
      };

      // Vérifier immédiatement
      reloadAssetsWhenAvailable();

      // Puis vérifier périodiquement (toutes les 3 secondes)
      const checkInterval = setInterval(reloadAssetsWhenAvailable, 3000);

      return () => clearInterval(checkInterval);
    } else {
      console.log('🚫 GameCanvas: Mode démo - rechargement automatique désactivé');
    }

    return () => {};
  }, [state.currentInvestigation]);

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
