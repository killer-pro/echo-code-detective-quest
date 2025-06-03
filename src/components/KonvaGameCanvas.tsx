
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Rect, Text, Group } from 'react-konva';
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
  const [characterImages, setCharacterImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [playerPosition, setPlayerPosition] = useState({ x: 400, y: 500 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const stageRef = useRef<Konva.Stage>(null);

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
        const interactionDistance = 80;
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
    const speed = 3;
    const interval = setInterval(() => {
      setPlayerPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.has('ArrowLeft')) newX -= speed;
        if (keys.has('ArrowRight')) newX += speed;
        if (keys.has('ArrowUp')) newY -= speed;
        if (keys.has('ArrowDown')) newY += speed;

        // Limiter aux bords
        newX = Math.max(20, Math.min(780, newX));
        newY = Math.max(20, Math.min(580, newY));

        return { x: newX, y: newY };
      });
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [keys]);

  // Recharger les assets quand ils changent (sauf en mode démo)
  useEffect(() => {
    if (state.currentInvestigation?.id !== 'demo-investigation-001') {
      console.log('🔄 KonvaGameCanvas: Surveillance des assets activée');

      const reloadAssetsWhenAvailable = () => {
        const assets = assetManager.getAllAssets();
        console.log('📦 KonvaGameCanvas: Assets disponibles:', assets.length);
        
        if (assets.length > 0) {
          // Recharger l'arrière-plan
          const backgroundUrl = assetManager.getBackgroundUrl();
          if (backgroundUrl && (!backgroundImage || backgroundImage.src !== backgroundUrl)) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => setBackgroundImage(img);
            img.src = backgroundUrl;
          }
        }
      };

      const checkInterval = setInterval(reloadAssetsWhenAvailable, 3000);
      return () => clearInterval(checkInterval);
    }
  }, [state.currentInvestigation, backgroundImage]);

  const handleCharacterClick = (character: Character) => {
    console.log(`🖱️ KonvaGameCanvas: Clic sur ${character.name}`);
    onCharacterClick(character);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
      <div 
        className="w-[800px] h-[600px] border border-slate-500 rounded bg-slate-900"
        style={{ 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' 
        }}
      >
        <Stage width={800} height={600} ref={stageRef}>
          <Layer>
            {/* Arrière-plan */}
            {backgroundImage ? (
              <Image
                image={backgroundImage}
                width={800}
                height={600}
              />
            ) : (
              <Rect
                width={800}
                height={600}
                fill="#333333"
              />
            )}

            {/* Personnages */}
            {characters.map((character) => {
              const characterImage = characterImages.get(character.id);
              return (
                <Group
                  key={character.id}
                  x={character.position.x}
                  y={character.position.y}
                  onClick={() => handleCharacterClick(character)}
                  onTap={() => handleCharacterClick(character)}
                >
                  {characterImage ? (
                    <Image
                      image={characterImage}
                      width={60}
                      height={80}
                      offsetX={30}
                      offsetY={40}
                      onMouseEnter={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'default';
                      }}
                    />
                  ) : (
                    <Rect
                      width={40}
                      height={60}
                      offsetX={20}
                      offsetY={30}
                      fill={character.role === 'témoin' ? '#2ecc71' : 
                            character.role === 'suspect' ? '#e74c3c' : 
                            character.role === 'enquêteur' ? '#3498db' : '#95a5a6'}
                      stroke="#ffffff"
                      strokeWidth={2}
                      onMouseEnter={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = 'default';
                      }}
                    />
                  )}
                  
                  {/* Nom du personnage */}
                  <Text
                    text={character.name}
                    fontSize={14}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    offsetX={character.name.length * 4}
                    y={-50}
                  />
                  
                  {/* Rôle du personnage */}
                  <Text
                    text={character.role.toUpperCase()}
                    fontSize={10}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    offsetX={character.role.length * 3}
                    y={50}
                  />
                </Group>
              );
            })}

            {/* Joueur */}
            <Rect
              x={playerPosition.x}
              y={playerPosition.y}
              width={40}
              height={60}
              offsetX={20}
              offsetY={30}
              fill="#0099ff"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default KonvaGameCanvas;
