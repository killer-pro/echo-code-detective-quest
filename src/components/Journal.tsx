
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { MessageSquare, Users, Search, BookOpen, Eye, EyeOff } from 'lucide-react';
import { DialogEntry, Character, Lead } from '../types';

interface JournalProps {
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  characters: Character[];
  investigation?: {
    context?: string;
    description?: string;
    title?: string;
  };
}

const Journal: React.FC<JournalProps> = ({ 
  dialogHistory, 
  discoveredLeads, 
  characters,
  investigation 
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const getCharacterDialogs = (characterId: string) => {
    return dialogHistory.filter(dialog => dialog.character_id === characterId);
  };

  const formatPersonality = (personality: any) => {
    if (typeof personality === 'string') {
      try {
        return JSON.parse(personality);
      } catch {
        return { traits: [personality] };
      }
    }
    return personality || {};
  };

  const toggleSecrets = (characterId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [characterId]: !prev[characterId]
    }));
  };

  const getCharacterById = (characterId: string) => {
    return characters.find(char => char.id === characterId);
  };

  const getTruthfulnessColor = (likelihood: number) => {
    if (likelihood >= 0.7) return 'text-green-400';
    if (likelihood >= 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full bg-slate-800">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Journal d'Enquête
        </h2>
      </div>

      <Tabs defaultValue="context" className="h-[calc(100%-80px)]">
        <TabsList className="w-full bg-slate-700 border-b border-slate-600">
          <TabsTrigger value="context" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Contexte
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Personnages
          </TabsTrigger>
          <TabsTrigger value="dialogs" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Dialogues
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Indices
          </TabsTrigger>
        </TabsList>

        <div className="p-4 h-full">
          <TabsContent value="context" className="h-full">
            <ScrollArea className="h-full">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    {investigation?.title || 'Enquête'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investigation?.description && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Description</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {investigation.description}
                      </p>
                    </div>
                  )}
                  
                  {investigation?.context && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Contexte Initial</h4>
                      <p className="text-gray-300 text-sm leading-relaxed bg-slate-600 p-3 rounded-lg">
                        {investigation.context}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-white font-medium mb-2">Progression</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Personnages interrogés:</span>
                        <span className="text-white">
                          {new Set(dialogHistory.map(d => d.character_id)).size} / {characters.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Indices découverts:</span>
                        <span className="text-white">{discoveredLeads.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Conversations menées:</span>
                        <span className="text-white">{dialogHistory.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="characters" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {characters.map((character) => {
                  const personality = formatPersonality(character.personality);
                  const characterDialogs = getCharacterDialogs(character.id);
                  const hasBeenTalkedTo = characterDialogs.length > 0;
                  
                  return (
                    <Card key={character.id} className="bg-slate-700 border-slate-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            {character.name}
                            {hasBeenTalkedTo && (
                              <Badge variant="secondary" className="bg-green-600/20 text-green-300 text-xs">
                                Contacté
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {character.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h5 className="text-gray-300 font-medium text-sm mb-1">Connaissances</h5>
                          <p className="text-gray-400 text-sm">{character.knowledge}</p>
                        </div>

                        {personality.traits && Array.isArray(personality.traits) && (
                          <div>
                            <h5 className="text-gray-300 font-medium text-sm mb-2">Traits de personnalité</h5>
                            <div className="flex flex-wrap gap-1">
                              {personality.traits.map((trait: string, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-300 text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {personality.secrets && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-gray-300 font-medium text-sm">Secrets</h5>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSecrets(character.id)}
                                className="text-gray-400 hover:text-white h-6 w-6 p-0"
                              >
                                {showSecrets[character.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                            </div>
                            {showSecrets[character.id] && (
                              <p className="text-gray-400 text-sm bg-slate-600 p-2 rounded border-l-2 border-red-500">
                                {personality.secrets}
                              </p>
                            )}
                          </div>
                        )}

                        {personality.motivations && (
                          <div>
                            <h5 className="text-gray-300 font-medium text-sm mb-1">Motivations</h5>
                            <p className="text-gray-400 text-sm">{personality.motivations}</p>
                          </div>
                        )}

                        {hasBeenTalkedTo && (
                          <div className="pt-2 border-t border-slate-600">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Interactions: {characterDialogs.length}</span>
                              <span>Réputation: {character.reputation_score || 50}/100</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dialogs" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {/* Filtre par personnage */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={selectedCharacter === null ? "default" : "outline"}
                    onClick={() => setSelectedCharacter(null)}
                    className="text-xs"
                  >
                    Tous
                  </Button>
                  {characters.map((character) => (
                    <Button
                      key={character.id}
                      size="sm"
                      variant={selectedCharacter === character.id ? "default" : "outline"}
                      onClick={() => setSelectedCharacter(character.id)}
                      className="text-xs"
                    >
                      {character.name}
                    </Button>
                  ))}
                </div>

                {/* Liste des dialogues */}
                <div className="space-y-3">
                  {dialogHistory
                    .filter(dialog => selectedCharacter === null || dialog.character_id === selectedCharacter)
                    .map((dialog) => {
                      const character = getCharacterById(dialog.character_id);
                      return (
                        <Card key={dialog.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">
                                Conversation avec {character?.name || 'Inconnu'}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getTruthfulnessColor(dialog.truth_likelihood)}`}
                                >
                                  Véracité: {Math.round(dialog.truth_likelihood * 100)}%
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(dialog.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="bg-slate-600 p-2 rounded">
                                <span className="text-blue-300 font-medium text-sm">Vous: </span>
                                <span className="text-gray-300 text-sm">{dialog.user_input}</span>
                              </div>
                              
                              <div className="bg-slate-800 p-2 rounded">
                                <span className="text-green-300 font-medium text-sm">{character?.name}: </span>
                                <span className="text-gray-300 text-sm">{dialog.character_reply}</span>
                              </div>
                            </div>

                            {dialog.clickable_keywords.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {dialog.clickable_keywords.map((keyword, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="leads" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {discoveredLeads.length === 0 ? (
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucun indice découvert pour le moment</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Interrogez les personnages pour découvrir des indices
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  discoveredLeads.map((lead) => {
                    const sourceCharacter = getCharacterById(lead.source_pnj || '');
                    return (
                      <Card key={lead.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-medium">Indice découvert</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={lead.resolved ? "secondary" : "outline"}
                                className={lead.resolved ? "bg-green-600/20 text-green-300" : ""}
                              >
                                {lead.resolved ? "Résolu" : "En cours"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Confiance: {Math.round((lead.confidence_level || 0.5) * 100)}%
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3">{lead.description}</p>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              Source: {sourceCharacter?.name || 'Inconnue'}
                            </span>
                            <span>{lead.discovered_at}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Journal;
