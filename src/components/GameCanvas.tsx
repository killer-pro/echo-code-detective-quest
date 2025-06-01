
import React, { useEffect, useRef } from 'react';
import { GameManager } from '../phaser/Game';
import { MainScene } from '../phaser/scenes/MainScene';
import { Character } from '../types';

interface GameCanvasProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
  className?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ characters, onCharacterClick, className }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameManager = useRef<GameManager | null>(null);

  useEffect(() => {
    if (gameRef.current) {
      gameManager.current = GameManager.getInstance();
      const game = gameManager.current.init(gameRef.current.id);
      
      // Configuration de la scène une fois qu'elle est prête
      const mainScene = game.scene.getScene('MainScene') as MainScene;
      if (mainScene) {
        mainScene.setCharacterClickHandler(onCharacterClick);
      }

      return () => {
        gameManager.current?.destroy();
      };
    }
  }, [onCharacterClick]);

  useEffect(() => {
    if (gameManager.current) {
      const game = gameManager.current.getGame();
      if (game) {
        const mainScene = game.scene.getScene('MainScene') as MainScene;
        if (mainScene && mainScene.scene.isVisible()) {
          mainScene.setCharacters(characters);
        }
      }
    }
  }, [characters]);

  return (
    <div 
      ref={gameRef} 
      id="phaser-game" 
      className={`border border-gray-700 rounded-lg overflow-hidden ${className}`}
      style={{ width: '800px', height: '600px' }}
    />
  );
};

export default GameCanvas;
