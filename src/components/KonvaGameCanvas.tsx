
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Rect, Text, Group, Circle } from 'react-konva';
import { Character } from '../types';
import { assetManager } from '../utils/assetManager';
import { useGame } from '../context/GameContext';
import Konva from 'konva';

interface KonvaGameCanvasProps {
  characters: Character[];
  onCharacterClick: (character: Character) => void;
}

const KonvaGameCanvas: React.FC<KonvaGameCanvasProps> = ({ characters, onCharacterClick }) => {
  const { state } = useGame();
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [characterImages, setCharacterImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [playerPosition, setPlayerPosition] = useState({ x: 600, y: 750 }); // Position plus centrale sur map agrandie
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Taille agrandie de la map
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 900;

  // Charger l'image d'arrière-plan
  useEffect(() => {
    const loadBackground = async () => {
      const backgroundUrl = assetManager.getBackgroundUrl();
      if (backgroundUrl) {
        console.log('🖼️ KonvaGameCanvas: Chargement arrière-plan:', backgroundUrl);
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('✅ KonvaGameCanvas: Arrière-plan chargé');
          setBackgroundImage(img);
        };
        img.onerror = (error) => {
          console.error('💥 KonvaGameCanvas: Erreur chargement arrière-plan:', error);
        };
        img.src = backgroundUrl;
      }
    };

    if (assetManager.isReady()) {
      loadBackground();
    }
  }, [state.currentInvestigation]);

  // Charger l'image du joueur
  useEffect(() => {
    const loadPlayerImage = async () => {
      const playerImageUrl = assetManager.getPlayerImageUrl();
      if (playerImageUrl) {
        console.log('👤 KonvaGameCanvas: Chargement image joueur:', playerImageUrl);
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('✅ KonvaGameCanvas: Image joueur chargée');
          setPlayerImage(img);
        };
        img.onerror = (error) => {
          console.error('💥 KonvaGameCanvas: Erreur chargement image joueur:', error);
        };
        img.src = playerImageUrl;
      }
    };

    if (assetManager.isReady()) {
      loadPlayerImage();
    }
  }, [state.currentInvestigation]);

  // Charger les images des personnages
  useEffect(() => {
    const loadCharacterImages = async () => {
      console.log('👥 KonvaGameCanvas: Chargement images personnages:', characters.length);
      const newCharacterImages = new Map<string, HTMLImageElement>();

      for (const character of characters) {
        const characterAssetUrl = assetManager.getCharacterAssetByName(character.name);
        if (characterAssetUrl) {
          console.log(`👤 KonvaGameCanvas: Chargement image pour ${character.name}:`, characterAssetUrl);
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              console.log(`✅ KonvaGameCanvas: Image chargée pour ${character.name}`);
              newCharacterImages.set(character.id, img);
              resolve();
            };
            img.onerror = (error) => {
              console.error(`💥 KonvaGameCanvas: Erreur chargement image ${character.name}:`, error);
              resolve();
            };
            img.src = characterAssetUrl;
          });
        }
      }

      setCharacterImages(newCharacterImages);
      console.log(`✅ KonvaGameCanvas: ${newCharacterImages.size} images de personnages chargées`);
    };

    if (characters.length > 0 && assetManager.isReady()) {
      loadCharacterImages();
    }
  }, [characters, state.currentInvestigation]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.code));
      
      // Interaction avec ESPACE
      if (e.code === 'Space') {
        const interactionDistance = 100;
        for (const character of characters) {
          const distance = Math.sqrt(
            Math.pow(playerPosition.x - character.position.x, 2) +
            Math.pow(playerPosition.y - character.position.y, 2)
          );
          if (distance < interactionDistance) {
            console.log(`🎮 KonvaGameCanvas: Interaction avec ${character.name}`);
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
  }, [characters, playerPosition, onCharacterClick]);

  // Animation du joueur
  useEffect(() => {
    const speed = 4;
    const interval = setInterval(() => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.has('ArrowLeft')) newX -= speed;
        if (keys.has('ArrowRight')) newX += speed;
        if (keys.has('ArrowUp')) newY -= speed;
        if (keys.has('ArrowDown')) newY += speed;

        // Limiter aux bords de la map agrandie
        newX = Math.max(40, Math.min(MAP_WIDTH - 40, newX));
        newY = Math.max(40, Math.min(MAP_HEIGHT - 40, newY));

        return { x: newX, y: newY };
      });
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [keys]);

  const handleCharacterClick = (character: Character) => {
    console.log(`🖱️ KonvaGameCanvas: Clic sur ${character.name}`);
    onCharacterClick(character);
  };

  const getCharacterInteractionDistance = (character: Character): number => {
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - character.position.x, 2) +
      Math.pow(playerPosition.y - character.position.y, 2)
    );
    return distance;
  };

  const isCharacterInRange = (character: Character): boolean => {
    return getCharacterInteractionDistance(character) < 100;
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
      <div 
        className="border border-slate-500 rounded bg-slate-900 relative overflow-auto"
        style={{ 
          width: '100%',
          height: '100%',
          maxWidth: `${MAP_WIDTH}px`,
          maxHeight: `${MAP_HEIGHT}px`,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' 
        }}
      >
        <Stage width={MAP_WIDTH} height={MAP_HEIGHT} ref={stageRef}>
          <Layer>
            {/* Arrière-plan */}
            {backgroundImage ? (
              <Image
                image={backgroundImage}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
              />
            ) : (
              <Rect
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                fill="linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)"
              />
            )}

            {/* Zones d'interaction pour les personnages */}
            {characters.map((character) => (
              <Circle
                key={`interaction-${character.id}`}
                x={character.position.x}
                y={character.position.y}
                radius={100}
                fill="rgba(59, 130, 246, 0.1)"
                stroke={isCharacterInRange(character) ? "#3b82f6" : "transparent"}
                strokeWidth={2}
                dash={[5, 5]}
                visible={isCharacterInRange(character)}
              />
            ))}

            {/* Personnages */}
            {characters.map((character) => {
              const characterImage = characterImages.get(character.id);
              const isInRange = isCharacterInRange(character);
              const isHovered = hoveredCharacter === character.id;
              
              return (
                <Group
                  key={character.id}
                  x={character.position.x}
                  y={character.position.y}
                  onClick={() => handleCharacterClick(character)}
                  onTap={() => handleCharacterClick(character)}
                  onMouseEnter={() => {
                    setHoveredCharacter(character.id);
                    const stage = stageRef.current;
                    if (stage) stage.container().style.cursor = 'pointer';
                  }}
                  onMouseLeave={() => {
                    setHoveredCharacter(null);
                    const stage = stageRef.current;
                    if (stage) stage.container().style.cursor = 'default';
                  }}
                >
                  {/* Ombre du personnage */}
                  <Circle
                    x={0}
                    y={40}
                    radius={30}
                    fill="rgba(0, 0, 0, 0.3)"
                    scaleY={0.5}
                  />
                  
                  {/* Image ou rectangle du personnage */}
                  {characterImage ? (
                    <Image
                      image={characterImage}
                      width={70}
                      height={90}
                      offsetX={35}
                      offsetY={45}
                      scaleX={isHovered ? 1.1 : 1}
                      scaleY={isHovered ? 1.1 : 1}
                      filters={isInRange ? [] : [Konva.Filters.Brighten]}
                      brightness={isInRange ? 0 : -0.3}
                    />
                  ) : (
                    <Rect
                      width={50}
                      height={70}
                      offsetX={25}
                      offsetY={35}
                      fill={character.role === 'témoin' ? '#10b981' : 
                            character.role === 'suspect' ? '#ef4444' : 
                            character.role === 'enquêteur' ? '#3b82f6' : '#6b7280'}
                      stroke="#ffffff"
                      strokeWidth={2}
                      cornerRadius={5}
                      scaleX={isHovered ? 1.1 : 1}
                      scaleY={isHovered ? 1.1 : 1}
                    />
                  )}
                  
                  {/* Nom du personnage */}
                  <Text
                    text={character.name}
                    fontSize={16}
                    fontFamily="Arial, sans-serif"
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    offsetX={character.name.length * 5}
                    y={-70}
                    visible={isHovered || isInRange}
                  />
                  
                  {/* Rôle du personnage */}
                  <Text
                    text={character.role.toUpperCase()}
                    fontSize={12}
                    fontFamily="Arial, sans-serif"
                    fill={character.role === 'témoin' ? '#10b981' : 
                          character.role === 'suspect' ? '#ef4444' : 
                          character.role === 'enquêteur' ? '#3b82f6' : '#6b7280'}
                    stroke="black"
                    strokeWidth={1}
                    offsetX={character.role.length * 4}
                    y={60}
                  />

                  {/* Indicateur d'interaction */}
                  {isInRange && (
                    <Text
                      text="ESPACE pour interagir"
                      fontSize={14}
                      fontFamily="Arial, sans-serif"
                      fill="#fbbf24"
                      stroke="black"
                      strokeWidth={1}
                      offsetX={90}
                      y={-90}
                    />
                  )}
                </Group>
              );
            })}

            {/* Joueur */}
            <Group x={playerPosition.x} y={playerPosition.y}>
              {/* Ombre du joueur */}
              <Circle
                x={0}
                y={40}
                radius={30}
                fill="rgba(0, 0, 0, 0.3)"
                scaleY={0.5}
              />
              
              {/* Image ou rectangle du joueur */}
              {playerImage ? (
                <Image
                  image={playerImage}
                  width={60}
                  height={80}
                  offsetX={30}
                  offsetY={40}
                />
              ) : (
                <Rect
                  width={50}
                  height={70}
                  offsetX={25}
                  offsetY={35}
                  fill="#0ea5e9"
                  stroke="#ffffff"
                  strokeWidth={3}
                  cornerRadius={5}
                />
              )}
              
              {/* Indicateur de direction */}
              <Circle
                x={0}
                y={-50}
                radius={4}
                fill="#0ea5e9"
              />
            </Group>
          </Layer>
        </Stage>

        {/* Mini-carte agrandie */}
        <div className="absolute top-4 right-4 w-40 h-32 bg-black/50 rounded border border-slate-500 p-2">
          <div className="text-white text-xs mb-1">Mini-carte</div>
          <div className="relative w-full h-24 bg-slate-700 rounded">
            {/* Point joueur sur mini-carte */}
            <div 
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
                top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
            {/* Points personnages sur mini-carte */}
            {characters.map((character) => (
              <div
                key={`minimap-${character.id}`}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  character.role === 'témoin' ? 'bg-green-400' :
                  character.role === 'suspect' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}
                style={{
                  left: `${(character.position.x / MAP_WIDTH) * 100}%`,
                  top: `${(character.position.y / MAP_HEIGHT) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KonvaGameCanvas;
