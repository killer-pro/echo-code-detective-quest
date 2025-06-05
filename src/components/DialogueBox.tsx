
import React, { useState, useRef, useEffect } from 'react';
import { Character, DialogEntry } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { X, Send, Loader2, User } from 'lucide-react';

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
    <div className="h-96 flex flex-col">
      {/* Compact header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {character.image_url ? (
              <img
                src={character.image_url}
                alt={character.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              character.name.charAt(0)
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{character.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs py-0">
                {character.role}
              </Badge>
              <span className={`text-xs ${getReputationColor(character.reputation_score)}`}>
                {character.reputation_score}%
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {characterDialogs.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <p className="text-sm">Start the conversation with {character.name}</p>
              <p className="text-xs mt-1 text-gray-500">Ask questions about the investigation...</p>
            </div>
          ) : (
            characterDialogs.map((dialog, index) => (
              <div key={dialog.id + '-' + index} className="space-y-2">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600/80 text-white p-2 rounded-lg max-w-[80%] text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs opacity-70">You</span>
                    </div>
                    {dialog.user_input}
                  </div>
                </div>

                {/* Character response */}
                <div className="flex justify-start">
                  <div className="bg-slate-700/80 text-white p-2 rounded-lg max-w-[80%] text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span className="text-xs opacity-70">{character.name}</span>
                    </div>
                    <p className="mb-2">{dialog.character_reply}</p>
                    
                    {/* Compact indicators */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-600/50">
                      <div className={`w-1.5 h-1.5 rounded-full ${getTruthColor(dialog.truth_likelihood)}`} />
                      <span className="text-xs text-gray-400">
                        {Math.round(dialog.truth_likelihood * 100)}%
                      </span>
                      
                      {dialog.reputation_impact !== 0 && (
                        <Badge 
                          variant={dialog.reputation_impact > 0 ? "default" : "destructive"}
                          className="text-xs py-0 px-1 h-4"
                        >
                          {dialog.reputation_impact > 0 ? '+' : ''}{dialog.reputation_impact}
                        </Badge>
                      )}
                    </div>

                    {/* Clickable keywords */}
                    {dialog.clickable_keywords && dialog.clickable_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 text-black">
                        {dialog.clickable_keywords.map((keyword, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-5 px-2 py-0"
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
      <div className="p-3 border-t border-white/20">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
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
