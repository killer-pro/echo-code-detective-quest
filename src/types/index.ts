
// Types principaux pour EchoCode
export interface Character {
  id: string;
  investigation_id: string;
  name: string;
  role: 'témoin' | 'suspect' | 'enquêteur' | 'innocent';
  personality: {
    traits: string[];
    emotional_state: string;
    cooperation_level: number;
  };
  knowledge: string;
  expression_state: 'neutre' | 'nerveux' | 'en_colère' | 'coopératif' | 'méfiant';
  reputation_score: number;
  alerted: boolean;
  last_interactions: DialogEntry[];
  position: { x: number; y: number };
  sprite: string;
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

export interface Investigation {
  id: string;
  title: string;
  prompt: string;
  created_by: string;
  map_id: string;
  created_at: string;
  characters: Character[];
  leads: Lead[];
  status: 'en_cours' | 'terminée' | 'abandonnée';
}

export interface Lead {
  id: string;
  investigation_id: string;
  description: string;
  source_pnj: string;
  confidence_level: number;
  resolved: boolean;
  discovered_at: string;
}

export interface MapData {
  id: string;
  name: string;
  json_data: {
    width: number;
    height: number;
    tileSize: number;
    layers: any[];
    objects: any[];
  };
  assets_used: string[];
}

export interface GameState {
  currentInvestigation: Investigation | null;
  playerPosition: { x: number; y: number };
  activeCharacter: Character | null;
  dialogHistory: DialogEntry[];
  discoveredLeads: Lead[];
  reputation: Record<string, number>;
}

export interface ReputationState {
  character_id: string;
  score: number;
  interactions_count: number;
  last_interaction: string;
  alerted_others: boolean;
}
