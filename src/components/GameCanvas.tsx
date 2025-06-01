
import React, { useEffect, useRef } from 'react';
import { GameManager } from '../phaser/Game';
import { Character } from '../types';

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
      // Pas de cleanup automatique - on garde l'instance pour éviter les recreations
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

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden">
      <div 
        ref={gameRef} 
        id="game-container"
        className="w-[800px] h-[600px] border border-slate-600 rounded"
      />
    </div>
  );
};

export default GameCanvas;
