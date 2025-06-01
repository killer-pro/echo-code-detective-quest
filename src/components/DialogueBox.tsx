
import React, { useState, useRef, useEffect } from 'react';
import { Character, DialogEntry } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, User } from 'lucide-react';

interface DialogueBoxProps {
  character: Character;
  dialogHistory: DialogEntry[];
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({
  character,
  dialogHistory,
  onSendMessage,
  onClose,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const characterDialogs = dialogHistory.filter(d => d.character_id === character.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [characterDialogs]);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      await onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getExpressionEmoji = (expression: string) => {
    const expressions = {
      neutre: '😐',
      nerveux: '😰',
      en_colère: '😠',
      coopératif: '😊',
      méfiant: '🤨',
    };
    return expressions[expression as keyof typeof expressions] || '😐';
  };

  return (
    <Card className="w-full max-w-2xl bg-slate-900 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Dialogue avec {character.name}
          </CardTitle>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="text-white border-slate-600">
            {character.role}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Réputation:</span>
            <div className={`w-3 h-3 rounded-full ${getReputationColor(character.reputation_score)}`} />
            <span className="text-white">{character.reputation_score}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">État:</span>
            <span className="text-xl">{getExpressionEmoji(character.expression_state)}</span>
            <span className="text-white">{character.expression_state}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-80 w-full" ref={scrollRef}>
          <div className="space-y-3 pr-4">
            {characterDialogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Aucune conversation encore commencée.<br />
                Posez votre première question à {character.name}.
              </div>
            ) : (
              characterDialogs.map((dialog) => (
                <div key={dialog.id} className="space-y-3">
                  {/* Message du joueur */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tl-none">
                        {dialog.user_input}
                      </div>
                    </div>
                  </div>

                  {/* Réponse du personnage */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-lg">
                      {getExpressionEmoji(character.expression_state)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-700 text-white p-3 rounded-lg rounded-tl-none">
                        {dialog.character_reply}
                        
                        {dialog.clickable_keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {dialog.clickable_keywords.map((keyword, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-slate-500"
                                onClick={() => setMessage(keyword)}
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        <span>Fiabilité: {Math.round(dialog.truth_likelihood * 100)}%</span>
                        {dialog.reputation_impact !== 0 && (
                          <span className={dialog.reputation_impact > 0 ? 'text-green-400' : 'text-red-400'}>
                            {dialog.reputation_impact > 0 ? '+' : ''}{dialog.reputation_impact} réputation
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="bg-slate-700 text-gray-400 p-3 rounded-lg rounded-tl-none">
                  {character.name} réfléchit...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Posez une question à ${character.name}...`}
            disabled={isLoading}
            className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Envoyer
          </Button>
        </div>

        <div className="text-xs text-gray-400">
          Astuce: Cliquez sur les mots-clés dans les réponses pour les réutiliser dans vos questions.
        </div>
      </CardContent>
    </Card>
  );
};

export default DialogueBox;
