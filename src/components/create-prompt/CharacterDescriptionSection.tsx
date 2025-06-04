
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Character } from '../../types';

interface CharacterDescriptionSectionProps {
  characters: Character[];
  onCharacterEdit?: (character: Character) => void;
}

const CharacterDescriptionSection: React.FC<CharacterDescriptionSectionProps> = ({
  characters,
  onCharacterEdit
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'suspect':
        return 'destructive';
      case 'témoin':
        return 'default';
      case 'enquêteur':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPersonalityTraits = (personality: any) => {
    if (typeof personality === 'object' && personality.traits) {
      return personality.traits.join(', ');
    }
    return 'Non défini';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Personnages de l'enquête</h3>
        <p className="text-gray-600">Voici les personnages qui participeront à votre enquête. Vous pouvez les modifier avant de commencer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card 
            key={character.id} 
            className={`transition-all duration-200 hover:shadow-lg ${onCharacterEdit ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={() => onCharacterEdit && onCharacterEdit(character)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{character.name}</CardTitle>
                <Badge variant={getRoleBadgeVariant(character.role)}>
                  {character.role}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Image du personnage si disponible */}
              {character.image_url && (
                <div className="flex justify-center">
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-16 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Localisation */}
              {character.location_description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">📍 Localisation:</p>
                  <p className="text-sm text-gray-600">{character.location_description}</p>
                </div>
              )}

              {/* Personnalité */}
              <div>
                <p className="text-sm font-medium text-gray-700">🎭 Personnalité:</p>
                <p className="text-sm text-gray-600">{getPersonalityTraits(character.personality)}</p>
              </div>

              {/* Connaissances */}
              {character.knowledge && (
                <div>
                  <p className="text-sm font-medium text-gray-700">🧠 Connaissances:</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{character.knowledge}</p>
                </div>
              )}

              {/* Réputation */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">⭐ Réputation:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${character.reputation_score || 50}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{character.reputation_score || 50}%</span>
                </div>
              </div>

              {onCharacterEdit && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">Cliquez pour modifier</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun personnage généré pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default CharacterDescriptionSection;
