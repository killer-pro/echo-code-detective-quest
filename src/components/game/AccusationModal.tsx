import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, Users, Target } from 'lucide-react';
import { Character, Investigation } from '../../types';

interface AccusationModalProps {
  investigation: Investigation;
  characters: Character[];
  onAccuse: (characterId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AccusationModal: React.FC<AccusationModalProps> = ({
  investigation,
  characters,
  onAccuse,
  onCancel,
  isLoading
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const suspects = characters.filter(char => char.role === 'suspect' || char.role === 'témoin');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800 border-red-600/30">
        <CardHeader className="text-center border-b border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-6 h-6 text-red-500" />
            <CardTitle className="text-2xl text-white">Final Accusation</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">Warning: You only have one chance!</p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Choose the culprit:
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {suspects.map((character) => (
                <div
                  key={character.id}
                  onClick={() => setSelectedCharacter(character.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCharacter === character.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {character.image_url && (
                      <img
                        src={character.image_url}
                        alt={character.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-500"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{character.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={character.role === 'suspect' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {character.role}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          Reputation: {character.reputation_score}%
                        </span>
                      </div>
                    </div>
                    {selectedCharacter === character.id && (
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-white mb-2">Accusation Rules:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• You can only accuse once</li>
              <li>• If you find the real culprit, you win the investigation</li>
              <li>• If you are wrong, you lose the investigation</li>
              <li>• Analyze all clues before deciding</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedCharacter && onAccuse(selectedCharacter)}
              disabled={!selectedCharacter || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Accusing...' : 'Accuse this character'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccusationModal;
