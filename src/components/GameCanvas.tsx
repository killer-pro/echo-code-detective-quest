
import React, { useEffect, useRef } from 'react';
import { GameManager } from '../phaser/Game';
import { Character } from '../types';
import { assetManager } from '../utils/assetManager';

interface GameCanvasProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ characters, onCharacterClick }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

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
      const scene = gameInstanceRef.current.scene.getScene('MainScene');
      if (scene && typeof (scene as any).setCharacters === 'function') {
        (scene as any).setCharacters(characters);
      }
    }
  }, [characters]);

  // Recharger les assets quand ils sont générés
  useEffect(() => {
    const reloadAssets = () => {
      if (gameInstanceRef.current) {
        const scene = gameInstanceRef.current.scene.getScene('MainScene');
        if (scene && typeof (scene as any).reloadAssets === 'function') {
          (scene as any).reloadAssets();
        }
      }
    };

    // Surveiller les changements d'assets
    const checkAssets = setInterval(() => {
      const assets = assetManager.getAllAssets();
      if (assets.length > 0) {
        reloadAssets();
        clearInterval(checkAssets);
      }
    }, 1000);

    return () => clearInterval(checkAssets);
  }, []);

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
