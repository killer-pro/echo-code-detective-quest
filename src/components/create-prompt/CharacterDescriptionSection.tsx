
import React, { useState } from 'react';
import { Character } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Users, Edit3, Save, X } from 'lucide-react';

interface CharacterDescriptionSectionProps {
  characters: Character[];
  onCharacterUpdate: (characterId: string, updates: Partial<Character>) => void;
  onStartGame: () => void;
}

const CharacterDescriptionSection: React.FC<CharacterDescriptionSectionProps> = ({
  characters,
  onCharacterUpdate,
  onStartGame
}) => {
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Character>>({});

  const handleEdit = (character: Character) => {
    setEditingCharacter(character.id);
    setEditForm({
      name: character.name,
      role: character.role,
      personality: character.personality,
      secret: character.secret,
      location_description: character.location_description,
      reputation_score: character.reputation_score
    });
  };

  const handleSave = () => {
    if (editingCharacter) {
      onCharacterUpdate(editingCharacter, editForm);
      setEditingCharacter(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingCharacter(null);
    setEditForm({});
  };

  const getReputationColor = (score: number) => {
    if (score > 70) return 'text-green-400';
    if (score > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Investigation Characters
        </h2>
        <p className="text-gray-400">
          Review and modify the characters before starting your investigation
        </p>
      </div>

      <div className="grid gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    {character.image_url ? (
                      <img
                        src={character.image_url}
                        alt={character.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-purple-400 font-bold">
                        {character.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{character.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {character.role}
                      </Badge>
                      <span className={`text-xs ${getReputationColor(character.reputation_score)}`}>
                        Reputation: {character.reputation_score}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {editingCharacter === character.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(character)}>
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {editingCharacter === character.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Name</label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Role</label>
                      <Input
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Personality</label>
                    <Textarea
                      value={editForm.personality || ''}
                      onChange={(e) => setEditForm({ ...editForm, personality: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 resize-none"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Secret</label>
                    <Textarea
                      value={editForm.secret || ''}
                      onChange={(e) => setEditForm({ ...editForm, secret: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 resize-none"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Location</label>
                    <Input
                      value={editForm.location_description || ''}
                      onChange={(e) => setEditForm({ ...editForm, location_description: e.target.value })}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Reputation Score (0-100)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.reputation_score || 50}
                      onChange={(e) => setEditForm({ ...editForm, reputation_score: parseInt(e.target.value) || 50 })}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Personality:</span>
                    <p className="text-gray-300 mt-1">{character.personality}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Secret:</span>
                    <p className="text-gray-300 mt-1">{character.secret}</p>
                  </div>
                  
                  {character.location_description && (
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <p className="text-gray-300 mt-1">{character.location_description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-6">
        <Button
          onClick={onStartGame}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3"
        >
          Start Investigation
        </Button>
      </div>
    </div>
  );
};

export default CharacterDescriptionSection;
