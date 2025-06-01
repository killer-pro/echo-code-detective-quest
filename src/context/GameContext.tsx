
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Character, DialogEntry, Lead, Investigation } from '../types';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

type GameAction =
  | { type: 'SET_INVESTIGATION'; payload: Investigation }
  | { type: 'ADD_DIALOG'; payload: DialogEntry }
  | { type: 'UPDATE_CHARACTER_REPUTATION'; payload: { characterId: string; change: number } }
  | { type: 'SET_ACTIVE_CHARACTER'; payload: Character | null }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_PLAYER_POSITION'; payload: { x: number; y: number } }
  | { type: 'RESOLVE_LEAD'; payload: string };

const initialState: GameState = {
  currentInvestigation: null,
  playerPosition: { x: 400, y: 300 },
  activeCharacter: null,
  dialogHistory: [],
  discoveredLeads: [],
  reputation: {},
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_INVESTIGATION':
      return {
        ...state,
        currentInvestigation: action.payload,
        reputation: action.payload.characters.reduce((acc, char) => {
          acc[char.id] = char.reputation_score;
          return acc;
        }, {} as Record<string, number>),
      };

    case 'ADD_DIALOG':
      return {
        ...state,
        dialogHistory: [...state.dialogHistory, action.payload],
      };

    case 'UPDATE_CHARACTER_REPUTATION':
      return {
        ...state,
        reputation: {
          ...state.reputation,
          [action.payload.characterId]: Math.max(0, Math.min(100, 
            (state.reputation[action.payload.characterId] || 50) + action.payload.change
          )),
        },
      };

    case 'SET_ACTIVE_CHARACTER':
      return {
        ...state,
        activeCharacter: action.payload,
      };

    case 'ADD_LEAD':
      return {
        ...state,
        discoveredLeads: [...state.discoveredLeads, action.payload],
      };

    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        playerPosition: action.payload,
      };

    case 'RESOLVE_LEAD':
      return {
        ...state,
        discoveredLeads: state.discoveredLeads.map(lead =>
          lead.id === action.payload ? { ...lead, resolved: true } : lead
        ),
      };

    default:
      return state;
  }
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
