export interface Investigation {
  id: string;
  title: string;
  prompt: string;
  characters: Character[];
  created_by?: string;
  created_at?: string;
  status?: string;
  description?: string;
  context?: string;
  assetPrompts?: AssetPrompt[];
}

export interface AssetPrompt {
  type: 'background' | 'character' | 'prop';
  name: string;
  prompt: string;
  style: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'témoin' | 'suspect' | 'enquêteur' | 'innocent';
  personality: Record<string, any>;
  knowledge: string;
  position: { x: number; y: number };
  sprite?: string;
  expression_state?: string;
  alerted?: boolean;
  reputation_score: number;
  investigation_id?: string;
  created_at?: string;
}

export interface DialogEntry {
  id: string;
  character_id: string;
  user_input: string;
  character_reply: string;
  timestamp: string;
  clickable_keywords?: string[];
  reputation_impact?: number;
  truth_likelihood?: number;
  investigation_id?: string;
  created_at?: string;
}

export interface Lead {
  id: string;
  description: string;
  source_pnj?: string;
  confidence_level?: number;
  resolved?: boolean;
  discovered_at?: string;
  investigation_id?: string;
}

export interface InvestigationAsset {
  id: string;
  investigation_id: string;
  asset_name: string;
  asset_url: string;
  asset_type: 'background' | 'character' | 'prop';
  created_at?: string;
}

export interface GeneratedAsset {
  id: string;
  investigation_id: string;
  asset_name: string;
  image_url: string;
  asset_type: 'background' | 'character' | 'prop';
  prompt: string;
  created_at?: string;
}

export interface Asset {
  name: string;
  url: string;
  type: 'background' | 'character' | 'prop';
  characterId?: string;
}
