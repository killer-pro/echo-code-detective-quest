
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

  // Use dialogue_background_url instead of dialog_background_url
  const backgroundImage = character.dialogue_background_url;
  const characterImage = character.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with character image or fallback */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: backgroundImage 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
            : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
        }}
        onClick={onClose}
      />
      
      {/* Main dialogue container */}
      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-2 md:p-4">
        
        {/* Character portrait - left or right depending on space */}
        {characterImage && (
          <div className="hidden lg:block absolute left-4 md:left-8 transform -translate-y-1/2">
            <div className="relative">
              <img
                src={characterImage}
                alt={character.name}
                className="w-48 h-64 md:w-64 md:h-80 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))'
                }}
              />
              <div className="absolute -bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 md:px-4 py-1 md:py-2 rounded-full">
                <span className="font-semibold text-sm md:text-base">{character.name}</span>
                <span className="ml-2 text-xs md:text-sm text-gray-300">({character.role})</span>
              </div>
            </div>
          </div>
        )}

        {/* Dialogue area - centered or offset if portrait */}
        <div className={`relative ${characterImage ? 'lg:ml-64 lg:mr-8' : ''} w-full max-w-2xl`}>
          {/* Mobile version of portrait */}
          {characterImage && (
            <div className="lg:hidden mb-4 md:mb-6 flex justify-center">
              <div className="relative">
                <img
                  src={characterImage}
                  alt={character.name}
                  className="w-24 h-32 md:w-32 md:h-40 object-cover rounded-lg shadow-xl border-2 border-white/20"
                />
                <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  <span className="font-semibold">{character.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for dialogue content */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 transform -translate-y-1/2">
            <div className="text-center text-white">
              <h3 className="text-lg md:text-xl font-bold mb-2">{character.name}</h3>
              <p className="text-gray-300 mb-4 text-sm md:text-base">Conversation with {character.role}</p>
              <div className="text-xs md:text-sm text-gray-400">
                {character.location_description && (
                  <p className="mb-2">📍 {character.location_description}</p>
                )}
                <p>Reputation: {character.reputation_score}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-sm md:text-base"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DialogueOverlay;
