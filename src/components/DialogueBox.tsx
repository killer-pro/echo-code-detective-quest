
import React, { useState, useRef, useEffect } from 'react';
import { Character, DialogEntry } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { X, Send, Loader2 } from 'lucide-react';

interface DialogueBoxProps {
  character: Character;
  dialogHistory: DialogEntry[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({
  character,
  dialogHistory,
  onSendMessage,
  onClose,
  isLoading
}) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const characterDialogs = dialogHistory.filter(
    dialog => dialog.character_id === character.id
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [characterDialogs]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getTruthColor = (likelihood: number) => {
    if (likelihood > 0.7) return 'bg-green-500';
    if (likelihood > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getReputationColor = (score: number) => {
    if (score > 70) return 'text-green-400';
    if (score > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {character.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{character.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {character.role}
              </Badge>
              <span className={`text-xs ${getReputationColor(character.reputation_score)}`}>
                Réputation: {character.reputation_score}%
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {characterDialogs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Commencez la conversation avec {character.name}</p>
              <p className="text-sm mt-2">Posez des questions sur l'enquête...</p>
            </div>
          ) : (
            characterDialogs.map((dialog) => (
              <div key={dialog.id} className="space-y-3">
                {/* Message utilisateur */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%]">
                    {dialog.user_input}
                  </div>
                </div>

                {/* Réponse personnage */}
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white p-3 rounded-lg max-w-[80%]">
                    <p>{dialog.character_reply}</p>
                    
                    {/* Indicateurs */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-600">
                      <div className={`w-2 h-2 rounded-full ${getTruthColor(dialog.truth_likelihood)}`} />
                      <span className="text-xs text-gray-400">
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

                    {/* Mots-clés cliquables */}
                    {dialog.clickable_keywords && dialog.clickable_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dialog.clickable_keywords.map((keyword, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => setMessage(keyword)}
                          >
                            {keyword}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
