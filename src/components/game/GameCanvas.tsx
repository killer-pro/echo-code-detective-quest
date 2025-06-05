import React, { useEffect, useRef, useState } from 'react';
import { Character } from '../../types';
import { useGame } from '../../context/GameContext';

interface GameCanvasProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
  backgroundUrl?: string;
  isDialogueOpen: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  characters, 
  onCharacterClick, 
  backgroundUrl,
  isDialogueOpen 
}) => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 300 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);
  const [characterImages, setCharacterImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);

  // Canvas Dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Load Background Image
  useEffect(() => {
    if (backgroundUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBackgroundImage(img);
      img.onerror = () => console.warn('Background loading error:', backgroundUrl);
      img.src = backgroundUrl;
    }
  }, [backgroundUrl]);

  // Load Character Images
  useEffect(() => {
    const loadCharacterImages = async () => {
      const newImages = new Map<string, HTMLImageElement>();
      
      for (const character of characters) {
        if (character.image_url) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              newImages.set(character.id, img);
              resolve();
            };
            img.onerror = () => {
              console.warn(`Image loading error ${character.name}:`, character.image_url);
              resolve();
            };
            img.src = character.image_url!;
          });
        }
      }
      
      setCharacterImages(newImages);
    };

    if (characters.length > 0) {
      loadCharacterImages();
    }
  }, [characters]);

  // Load Player Image
  useEffect(() => {
    if (state.currentInvestigation?.player_image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setPlayerImage(img);
      img.onerror = () => setPlayerImage(null);
      img.src = state.currentInvestigation.player_image_url;
    }
  }, [state.currentInvestigation?.player_image_url]);

  // Keyboard Handling
  useEffect(() => {
    if (isDialogueOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.code));
      
      if (e.code === 'Space') {
        e.preventDefault();
        const interactionDistance = 80;
        for (const character of characters) {
          const distance = Math.sqrt(
            Math.pow(playerPosition.x - character.position.x, 2) +
            Math.pow(playerPosition.y - character.position.y, 2)
          );
          if (distance < interactionDistance) {
            onCharacterClick(character);
            break;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.code);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [characters, playerPosition, onCharacterClick, isDialogueOpen]);

  // Player Animation
  useEffect(() => {
    if (isDialogueOpen) return;

    const speed = 3;
    const interval = setInterval(() => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.has('ArrowLeft')) newX -= speed;
        if (keys.has('ArrowRight')) newX += speed;
        if (keys.has('ArrowUp')) newY -= speed;
        if (keys.has('ArrowDown')) newY += speed;

        newX = Math.max(30, Math.min(CANVAS_WIDTH - 30, newX));
        newY = Math.max(30, Math.min(CANVAS_HEIGHT - 30, newY));

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys, isDialogueOpen]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.5, '#334155');
      gradient.addColorStop(1, '#475569');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw Characters
    characters.forEach((character) => {
      const charImage = characterImages.get(character.id);
      const isHovered = hoveredCharacter === character.id;
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - character.position.x, 2) +
        Math.pow(playerPosition.y - character.position.y, 2)
      );
      const isInRange = distance < 80;

      // Interaction Zone
      if (isInRange) {
        ctx.beginPath();
        ctx.arc(character.position.x, character.position.y, 80, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Shadow
      ctx.beginPath();
      ctx.ellipse(character.position.x, character.position.y + 40, 25, 8, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      // Character Image or Rectangle
      if (charImage) {
        const size = isHovered ? 70 : 60;
        ctx.drawImage(
          charImage,
          character.position.x - size / 2,
          character.position.y - size / 2,
          size,
          size
        );
      } else {
        const size = isHovered ? 50 : 40;
        ctx.fillStyle = character.role === 'témoin' ? '#10b981' : 
                       character.role === 'suspect' ? '#ef4444' : 
                       character.role === 'enquêteur' ? '#3b82f6' : '#6b7280';
        ctx.fillRect(
          character.position.x - size / 2,
          character.position.y - size / 2,
          size,
          size
        );
      }

      // Name and Status
      if (isHovered || isInRange) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        ctx.strokeText(character.name, character.position.x, character.position.y - 50);
        ctx.fillText(character.name, character.position.x, character.position.y - 50);

        if (isInRange) {
          ctx.font = '12px Arial';
          ctx.fillStyle = '#fbbf24';
          ctx.strokeText('SPACE to interact', character.position.x, character.position.y - 70);
          ctx.fillText('SPACE to interact', character.position.x, character.position.y - 70);
        }
      }

      // Status Indicator
      const stateColor = character.alerted ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(character.position.x + 20, character.position.y - 20, 6, 0, 2 * Math.PI);
      ctx.fillStyle = stateColor;
      ctx.fill();
    });

    // Draw Player
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y + 25, 20, 0, Math.PI, false);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    if (playerImage) {
      ctx.drawImage(playerImage, playerPosition.x - 20, playerPosition.y - 30, 40, 50);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(playerPosition.x - 20, playerPosition.y - 30, 40, 50);
    } else {
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.fillRect(playerPosition.x - 20, playerPosition.y - 30, 40, 50);
      ctx.strokeRect(playerPosition.x - 20, playerPosition.y - 30, 40, 50);
    }

    // Indicateur de direction
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y - 40, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();

  }, [characters, characterImages, backgroundImage, playerPosition, hoveredCharacter, playerImage]);

  // Gestion des clics
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDialogueOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    for (const character of characters) {
      const distance = Math.sqrt(
        Math.pow(x - character.position.x, 2) +
        Math.pow(y - character.position.y, 2)
      );
      if (distance < 40) {
        onCharacterClick(character);
        break;
      }
    }
  };

  // Gestion du survol
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDialogueOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    let foundCharacter: string | null = null;
    for (const character of characters) {
      const distance = Math.sqrt(
        Math.pow(x - character.position.x, 2) +
        Math.pow(y - character.position.y, 2)
      );
      if (distance < 40) {
        foundCharacter = character.id;
        break;
      }
    }

    setHoveredCharacter(foundCharacter);
    if (canvas.style.cursor !== (foundCharacter ? 'pointer' : 'default')) {
      canvas.style.cursor = foundCharacter ? 'pointer' : 'default';
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCharacter(null)}
          className="border-2 border-slate-600 rounded-lg shadow-2xl bg-slate-800"
          style={{ filter: isDialogueOpen ? 'blur(2px)' : 'none' }}
        />
      </div>
    </div>
  );
};

export default GameCanvas;
