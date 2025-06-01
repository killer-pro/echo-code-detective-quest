
import React from 'react';
import { DialogEntry, Lead, Character } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

interface JournalProps {
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  characters: Character[];
}

const Journal: React.FC<JournalProps> = ({
  dialogHistory,
  discoveredLeads,
  characters
}) => {
  const getCharacterName = (characterId: string) => {
    return characters.find(c => c.id === characterId)?.name || 'Inconnu';
  };

  const getTruthColor = (likelihood: number) => {
    if (likelihood > 0.7) return 'text-green-400';
    if (likelihood > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (level: number) => {
    if (level > 0.7) return 'text-green-400';
    if (level > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full bg-slate-800">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Journal d'Enquête</h2>
      </div>

      <Tabs defaultValue="dialogues" className="h-[calc(100%-80px)]">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700">
          <TabsTrigger value="dialogues">Dialogues</TabsTrigger>
          <TabsTrigger value="leads">Indices</TabsTrigger>
          <TabsTrigger value="characters">Personnages</TabsTrigger>
        </TabsList>

        <TabsContent value="dialogues" className="h-full p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {dialogHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Aucun dialogue enregistré
                </p>
              ) : (
                dialogHistory.map((dialog) => (
                  <Card key={dialog.id} className="bg-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">
                          <User className="w-4 h-4 inline mr-2" />
                          {getCharacterName(dialog.character_id)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(dialog.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="bg-slate-600 p-2 rounded text-sm">
                        <strong>Vous:</strong> {dialog.user_input}
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-sm">
                        <strong>{getCharacterName(dialog.character_id)}:</strong> {dialog.character_reply}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                        <span className={`text-xs ${getTruthColor(dialog.truth_likelihood)}`}>
                          Fiabilité: {Math.round(dialog.truth_likelihood * 100)}%
                        </span>
                        {dialog.reputation_impact !== 0 && (
                          <Badge 
                            variant={dialog.reputation_impact > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {dialog.reputation_impact > 0 ? '+' : ''}{dialog.reputation_impact} rep
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="leads" className="h-full p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {discoveredLeads.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Aucun indice découvert
                </p>
              ) : (
                discoveredLeads.map((lead) => (
                  <Card key={lead.id} className="bg-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white flex items-center gap-2">
                          {lead.resolved ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          Indice #{lead.id.slice(-8)}
                        </CardTitle>
                        <span className={`text-xs ${getConfidenceColor(lead.confidence_level)}`}>
                          Confiance: {Math.round(lead.confidence_level * 100)}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-2">
                        {lead.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          Source: {lead.source_pnj ? getCharacterName(lead.source_pnj) : 'Observation'}
                        </span>
                        <span>
                          {new Date(lead.discovered_at).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="characters" className="h-full p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {characters.map((character) => (
                <Card key={character.id} className="bg-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{character.name}</span>
                      <Badge variant="secondary">{character.role}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Réputation:</span>
                        <span className={getTruthColor(character.reputation_score / 100)}>
                          {character.reputation_score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">État:</span>
                        <span className="text-gray-300">{character.expression_state}</span>
                      </div>
                      {character.personality && (
                        <div>
                          <span className="text-gray-400">Traits:</span>
                          <p className="text-gray-300 text-xs mt-1">
                            {JSON.stringify(character.personality).slice(0, 100)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal;
