
// Types spécifiques au jeu
import { type Json } from '../integrations/supabase/types';
import { type DialogEntry, type Lead } from './index';

export interface GameState {
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  reputation: { [characterId: string]: number };
  charactersAlerted: { [characterId: string]: boolean };
}

// Fonction utilitaire pour convertir GameState en Json compatible Supabase
export const gameStateToJson = (gameState: GameState): Json => {
  return JSON.parse(JSON.stringify(gameState));
};

// Fonction utilitaire pour convertir Json en GameState
export const jsonToGameState = (json: Json): GameState => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const obj = json as { [key: string]: Json };
    return {
      dialogHistory: (obj.dialogHistory as unknown as DialogEntry[]) || [],
      discoveredLeads: (obj.discoveredLeads as unknown as Lead[]) || [],
      reputation: (obj.reputation as { [characterId: string]: number }) || {},
      charactersAlerted: (obj.charactersAlerted as { [characterId: string]: boolean }) || {},
    };
  }
  
  // Fallback pour données invalides
  return {
    dialogHistory: [],
    discoveredLeads: [],
    reputation: {},
    charactersAlerted: {},
  };
};
