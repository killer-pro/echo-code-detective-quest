import React, { createContext, useContext, useReducer } from 'react';
import { Investigation, Character, DialogEntry, Lead } from '../types';

interface GameState {
  currentInvestigation: Investigation | null;
  dialogHistory: DialogEntry[];
  reputation: { [characterId: string]: number };
  activeCharacter: Character | null;
  discoveredLeads: Lead[];
  playerPosition: { x: number; y: number };
  charactersAlerted: { [characterId: string]: boolean };
}

const initialState: GameState = {
  currentInvestigation: null,
  dialogHistory: [],
  reputation: {},
  activeCharacter: null,
  discoveredLeads: [],
  playerPosition: { x: 600, y: 750 }, // Position mise à jour pour map agrandie
  charactersAlerted: {},
};

type GameAction =
  | { type: 'SET_INVESTIGATION'; payload: Investigation }
  | { type: 'ADD_DIALOG'; payload: DialogEntry }
  | { type: 'UPDATE_CHARACTER_REPUTATION'; payload: { characterId: string; change: number } }
  | { type: 'SET_ACTIVE_CHARACTER'; payload: Character | null }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_PLAYER_POSITION'; payload: { x: number; y: number } }
  | { type: 'RESOLVE_LEAD'; payload: string }
  | { type: 'UPDATE_CHARACTER_ALERTED_STATUS'; payload: { characterId: string; alerted: boolean } }
  | { type: 'LOAD_GAME_STATE'; payload: { 
      dialogHistory: DialogEntry[]; 
      discoveredLeads: Lead[]; 
      reputation: { [characterId: string]: number };
      playerPosition: { x: number; y: number };
      charactersAlerted: { [characterId: string]: boolean };
    } };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_INVESTIGATION':
      return { 
        ...state, 
        currentInvestigation: action.payload, 
        dialogHistory: [], 
        discoveredLeads: [],
        charactersAlerted: {}
      };
    case 'ADD_DIALOG':
      return { ...state, dialogHistory: [...state.dialogHistory, action.payload] };
    case 'UPDATE_CHARACTER_REPUTATION':
      return {
        ...state,
        reputation: {
          ...state.reputation,
          [action.payload.characterId]: (state.reputation[action.payload.characterId] || 0) + action.payload.change,
        },
      };
    case 'SET_ACTIVE_CHARACTER':
      return { ...state, activeCharacter: action.payload };
    case 'ADD_LEAD':
      return { ...state, discoveredLeads: [...state.discoveredLeads, action.payload] };
    case 'UPDATE_PLAYER_POSITION':
      return { ...state, playerPosition: action.payload };
    case 'RESOLVE_LEAD':
      return {
        ...state,
        discoveredLeads: state.discoveredLeads.map(lead =>
          lead.id === action.payload ? { ...lead, resolved: true } : lead
        ),
      };
    case 'UPDATE_CHARACTER_ALERTED_STATUS':
      return {
        ...state,
        charactersAlerted: {
          ...state.charactersAlerted,
          [action.payload.characterId]: action.payload.alerted
        },
        currentInvestigation: state.currentInvestigation
          ? {
              ...state.currentInvestigation,
              characters: state.currentInvestigation.characters.map(char =>
                char.id === action.payload.characterId ? { ...char, alerted: action.payload.alerted } : char
              ),
            }
          : state.currentInvestigation,
      };
    case 'LOAD_GAME_STATE':
      return {
        ...state,
        dialogHistory: action.payload.dialogHistory,
        discoveredLeads: action.payload.discoveredLeads,
        reputation: action.payload.reputation,
        playerPosition: action.payload.playerPosition,
        charactersAlerted: action.payload.charactersAlerted || {},
      };
    default:
      return state;
  }
};

interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextProps>({
  state: initialState,
  dispatch: () => null,
});

interface GameProviderProps {
  children: React.ReactNode;
}

const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export { GameProvider, useGame };
