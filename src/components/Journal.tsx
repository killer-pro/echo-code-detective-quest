
import React from 'react';
import { DialogEntry, Lead, Character } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, User, CheckCircle, AlertCircle, FileText, Eye, Heart, Brain } from 'lucide-react';
import { useGame } from '../context/GameContext';

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
  const { state } = useGame();

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

  const getReputationColor = (score: number) => {
    if (score > 70) return 'text-green-400';
    if (score > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPersonality = (personality: any) => {
    if (!personality) return null;
    
    if (typeof personality === 'string') {
      try {
        personality = JSON.parse(personality);
      } catch {
        return personality;
      }
    }

    return (
      <div className="space-y-2">
        {personality.traits && Array.isArray(personality.traits) && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Brain className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Traits</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {personality.traits.map((trait: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-blue-400/30 text-blue-300">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {personality.secrets && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">Secrets</span>
            </div>
            <p className="text-xs text-gray-300 bg-slate-800/50 p-2 rounded border-l-2 border-purple-400/30">
              {personality.secrets}
            </p>
          </div>
        )}
        
        {personality.motivations && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs font-medium text-red-400">Motivations</span>
            </div>
            <p className="text-xs text-gray-300 bg-slate-800/50 p-2 rounded border-l-2 border-red-400/30">
              {personality.motivations}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-800">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Journal d'Enquête</h2>
      </div>

      <Tabs defaultValue="context" className="h-[calc(100%-80px)]">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700">
          <TabsTrigger value="context">Contexte</TabsTrigger>
          <TabsTrigger value="dialogues">Dialogues</TabsTrigger>
          <TabsTrigger value="leads">Indices</TabsTrigger>
          <TabsTrigger value="characters">Personnages</TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="h-full p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {state.currentInvestigation ? (
                <Card className="bg-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      {state.currentInvestigation.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Description de l'enquête</h4>
                      <p className="text-gray-300 text-sm leading-relaxed bg-slate-800/50 p-3 rounded border-l-2 border-blue-400/30">
                        {state.currentInvestigation.description}
                      </p>
                    </div>
                    
                    {state.currentInvestigation.prompt && (
                      <div>
                        <h4 className="text-sm font-medium text-purple-400 mb-2">Prompt initial</h4>
                        <p className="text-gray-400 text-xs bg-slate-800/50 p-3 rounded border-l-2 border-purple-400/30">
                          {state.currentInvestigation.prompt}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        Statut: {state.currentInvestigation.status}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {state.currentInvestigation.characters.length} personnages impliqués
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Aucune enquête active
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

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
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {character.name.charAt(0)}
                        </div>
                        <span>{character.name}</span>
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`${character.role === 'suspect' ? 'bg-red-600/20 text-red-300' : 
                          character.role === 'témoin' ? 'bg-green-600/20 text-green-300' : 
                          character.role === 'enquêteur' ? 'bg-blue-600/20 text-blue-300' : 
                          'bg-gray-600/20 text-gray-300'}`}
                      >
                        {character.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Réputation:</span>
                        <span className={getReputationColor(character.reputation_score)}>
                          {character.reputation_score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">État:</span>
                        <span className="text-gray-300">{character.expression_state}</span>
                      </div>
                    </div>
                    
                    {character.knowledge && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400 mb-1">Connaissances:</h5>
                        <p className="text-gray-300 text-xs bg-slate-800/50 p-2 rounded border-l-2 border-gray-400/30">
                          {character.knowledge}
                        </p>
                      </div>
                    )}
                    
                    {character.personality && formatPersonality(character.personality)}
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
