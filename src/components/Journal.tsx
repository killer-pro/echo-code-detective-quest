
import React from 'react';
import { DialogEntry, Lead, Character } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Book, Users, Search, CheckCircle, AlertCircle } from 'lucide-react';

interface JournalProps {
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  characters: Character[];
  onReplayDialog?: (dialog: DialogEntry) => void;
}

const Journal: React.FC<JournalProps> = ({
  dialogHistory,
  discoveredLeads,
  characters,
  onReplayDialog,
}) => {
  const getCharacterName = (characterId: string) => {
    return characters.find(c => c.id === characterId)?.name || 'Inconnu';
  };

  const getLeadColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getReputationColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="w-full h-full bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Book className="w-5 h-5" />
          Journal d'enquête
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="characters" className="text-white">
              <Users className="w-4 h-4 mr-2" />
              Personnages
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-white">
              <Search className="w-4 h-4 mr-2" />
              Indices
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white">
              <Book className="w-4 h-4 mr-2" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="p-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {characters.map((character) => {
                  const interactions = dialogHistory.filter(d => d.character_id === character.id);
                  
                  return (
                    <div key={character.id} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{character.name}</h3>
                        <Badge variant="outline" className="text-white border-slate-600">
                          {character.role}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Réputation:</span>
                          <span className={getReputationColor(character.reputation_score)}>
                            {character.reputation_score}/100
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">État:</span>
                          <span className="text-white">{character.expression_state}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Interactions:</span>
                          <span className="text-white">{interactions.length}</span>
                        </div>

                        {character.personality.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {character.personality.traits.map((trait, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="leads" className="p-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {discoveredLeads.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Aucun indice découvert pour le moment.<br />
                    Interrogez les personnages pour en savoir plus.
                  </div>
                ) : (
                  discoveredLeads.map((lead) => (
                    <div key={lead.id} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {lead.resolved ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                          )}
                          <span className="text-white font-medium">
                            {lead.resolved ? 'Résolu' : 'En cours'}
                          </span>
                        </div>
                        <span className={`text-sm ${getLeadColor(lead.confidence_level)}`}>
                          Fiabilité: {Math.round(lead.confidence_level * 100)}%
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-2">{lead.description}</p>
                      
                      <div className="text-xs text-gray-400">
                        Source: {getCharacterName(lead.source_pnj)} • {lead.discovered_at}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="p-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {dialogHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Aucune conversation enregistrée.<br />
                    Commencez à parler aux personnages.
                  </div>
                ) : (
                  dialogHistory.slice().reverse().map((dialog) => (
                    <div key={dialog.id} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {getCharacterName(dialog.character_id)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(dialog.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-blue-400">Vous:</span>
                          <p className="text-gray-300 ml-2">{dialog.user_input}</p>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-400">{getCharacterName(dialog.character_id)}:</span>
                          <p className="text-gray-300 ml-2">{dialog.character_reply}</p>
                        </div>
                      </div>

                      {dialog.clickable_keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {dialog.clickable_keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-slate-500"
                              onClick={() => onReplayDialog?.(dialog)}
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span>Fiabilité: {Math.round(dialog.truth_likelihood * 100)}%</span>
                        {dialog.reputation_impact !== 0 && (
                          <span className={dialog.reputation_impact > 0 ? 'text-green-400' : 'text-red-400'}>
                            {dialog.reputation_impact > 0 ? '+' : ''}{dialog.reputation_impact} réputation
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Journal;
