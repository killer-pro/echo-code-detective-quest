
import React from 'react';
import { Character } from '../../types';

interface DialogueOverlayProps {
  character: Character;
  isVisible: boolean;
  onClose: () => void;
}

const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  character,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  // Utiliser dialogue_background_url au lieu de dialog_background_url
  const backgroundImage = character.dialogue_background_url;
  const characterImage = character.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background avec image du personnage ou fallback */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
            : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
        }}
        onClick={onClose}
      />
      
      {/* Container principal du dialogue */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4">
        
        {/* Portrait du personnage - gauche ou droite selon l'espace */}
        {characterImage && (
          <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <img
                src={characterImage}
                alt={character.name}
                className="w-64 h-80 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))'
                }}
              />
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full">
                <span className="font-semibold">{character.name}</span>
                <span className="ml-2 text-sm text-gray-300">({character.role})</span>
              </div>
            </div>
          </div>
        )}

        {/* Zone de dialogue - centrée ou décalée si portrait */}
        <div className={`relative ${characterImage ? 'lg:ml-80' : ''} w-full max-w-2xl`}>
          {/* Version mobile du portrait */}
          {characterImage && (
            <div className="lg:hidden mb-6 flex justify-center">
              <div className="relative">
                <img
                  src={characterImage}
                  alt={character.name}
                  className="w-32 h-40 object-cover rounded-lg shadow-xl border-2 border-white/20"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                  <span className="font-semibold">{character.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder pour le contenu du dialogue */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">{character.name}</h3>
              <p className="text-gray-300 mb-4">Conversation avec {character.role}</p>
              <div className="text-sm text-gray-400">
                {character.location_description && (
                  <p className="mb-2">📍 {character.location_description}</p>
                )}
                <p>Réputation: {character.reputation_score}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DialogueOverlay;
