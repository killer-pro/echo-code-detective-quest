
// Types de base pour les enquêtes
export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  investigation_id?: string;
  name: string;
  role: 'témoin' | 'suspect' | 'enquêteur' | 'innocent';
  personality: Record<string, any>;
  knowledge: string;
  expression_state: 'neutre' | 'nerveux' | 'en_colère' | 'coopératif' | 'méfiant';
  reputation_score: number;
  alerted: boolean;
  position: Position;
  sprite: string;
  created_at?: string;
}

export interface Investigation {
  id: string;
  title: string;
  prompt: string;
  created_by?: string;
  created_at?: string;
  status: 'en_cours' | 'terminée' | 'abandonnée';
  description?: string;
  characters: Character[];
}

export interface DialogEntry {
  id: string;
  character_id: string;
  user_input: string;
  character_reply: string;
  timestamp: string;
  clickable_keywords: string[];
  reputation_impact: number;
  truth_likelihood: number;
}

export interface Lead {
  id: string;
  investigation_id: string;
  description: string;
  source_pnj?: string;
  confidence_level: number;
  resolved: boolean;
  discovered_at: string;
}

export interface GameState {
  currentInvestigation: Investigation | null;
  playerPosition: Position;
  activeCharacter: Character | null;
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  reputation: Record<string, number>;
}
