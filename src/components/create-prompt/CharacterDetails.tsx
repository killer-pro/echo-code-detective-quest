
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Character } from '../../types';

interface CharacterDetailsProps {
  character: Character;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ character }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{character.name}</CardTitle>
          <Badge variant={character.role === 'suspect' ? 'destructive' : 'secondary'}>
            {character.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-600 mb-1">Connaissances</h4>
            <p className="text-sm text-gray-800">{character.knowledge}</p>
          </div>
          
          {character.personality && Object.keys(character.personality).length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Personnalité</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(character.personality).map(([key, value], index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {key}: {typeof value === 'string' || typeof value === 'number' ? String(value) : 'complex'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Réputation: {character.reputation_score}%</span>
            <span>État: {character.expression_state}</span>
          </div>
          
          {character.location_description && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Localisation</h4>
              <p className="text-sm text-gray-800">{character.location_description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterDetails;
