
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

interface EditForm {
  name?: string;
  role?: string;
  personality?: Record<string, unknown>;
  location_description?: string;
  reputation_score?: number;
}

const CharacterDescriptionSection: React.FC<CharacterDescriptionSectionProps> = ({
  characters,
  onCharacterUpdate,
  onStartGame
}) => {
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({});

  const handleEdit = (character: Character) => {
    setEditingCharacter(character.id);
    setEditForm({
      name: character.name,
      role: character.role,
      personality: typeof character.personality === 'string' 
        ? { traits: [character.personality] } 
        : character.personality,
      location_description: character.location_description,
      reputation_score: character.reputation_score
    });
  };

  const handleSave = () => {
    if (editingCharacter) {
      const updates: Partial<Character> = {
        name: editForm.name,
        role: editForm.role as any,
        personality: editForm.personality,
        location_description: editForm.location_description,
        reputation_score: editForm.reputation_score
      };
      onCharacterUpdate(editingCharacter, updates);
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

  const renderPersonality = (personality: any) => {
    if (typeof personality === 'string') {
      return personality;
    }
    if (typeof personality === 'object' && personality !== null) {
      if (personality.traits) {
        return `Traits: ${Array.isArray(personality.traits) ? personality.traits.join(', ') : personality.traits}`;
      }
      return JSON.stringify(personality);
    }
    return 'No personality defined';
  };

  const handlePersonalityChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setEditForm({ ...editForm, personality: parsed });
    } catch {
      setEditForm({ ...editForm, personality: { traits: [value] } });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6" />
          Investigation Characters
        </h2>
        <p className="text-sm md:text-base text-gray-400 px-4">
          Review and modify the characters before starting your investigation
        </p>
      </div>

      <div className="grid gap-3 md:gap-4">
        {characters.map((character) => (
          <Card key={character.id} className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3 md:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {character.image_url ? (
                      <img
                        src={character.image_url}
                        alt={character.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-purple-400 font-bold text-sm md:text-base">
                        {character.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-white text-base md:text-lg truncate">{character.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1 md:flex-none">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(character)} className="w-full md:w-auto">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {editingCharacter === character.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Name</label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Role</label>
                      <Input
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Personality</label>
                    <Textarea
                      value={JSON.stringify(editForm.personality || {})}
                      onChange={(e) => handlePersonalityChange(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 resize-none text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Location</label>
                    <Input
                      value={editForm.location_description || ''}
                      onChange={(e) => setEditForm({ ...editForm, location_description: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-sm"
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
                      className="bg-slate-700/50 border-slate-600 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Personality:</span>
                    <p className="text-gray-300 mt-1 text-sm leading-relaxed">{renderPersonality(character.personality)}</p>
                  </div>
                  
                  {character.location_description && (
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <p className="text-gray-300 mt-1 text-sm">{character.location_description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4 md:pt-6">
        <Button
          onClick={onStartGame}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 md:px-8 py-3 w-full md:w-auto"
        >
          Start Investigation
        </Button>
      </div>
    </div>
  );
};

export default CharacterDescriptionSection;
