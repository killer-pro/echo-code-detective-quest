// Custom types for the application
export type UUID = string;

export type CharacterRole = 'témoin' | 'suspect' | 'enquêteur' | 'innocent';
export type InvestigationStatus = 'en_cours' | 'terminée' | 'abandonnée';
export type GameResult = 'won' | 'lost' | 'ongoing';
export type ExpressionState = 'neutre' | 'nerveux' | 'en_colère' | 'coopératif' | 'méfiant';
export type AssetType = 'background' | 'character' | 'prop';
export type CloudinaryAssetType = 'background' | 'character' | 'prop' | 'dialogue_bg' | 'player';
export type ClueType = 'testimony' | 'physical_evidence' | 'behavior' | 'contradiction' | 'motive';

export interface Investigation {
  id: UUID;
  title: string;
  prompt: string;
  characters: Character[];
  created_by?: UUID;
  created_at?: string;
  status?: InvestigationStatus;
  description?: string;
  context?: string;
  assetPrompts?: AssetPrompt[];
  player_role?: string;
  assets?: Asset[];
  background_url?: string;
  background_prompt?: string;
  clues?: Clue[];
  player_image_url?: string;
  accused_character_id?: UUID;
  accusation_made?: boolean;
  game_result?: GameResult;
  culprit_character_id?: UUID;
  accusation_timestamp?: string;
}

export interface AssetPrompt {
  type: AssetType;
  name: string;
  prompt: string;
  style: string;
}

export interface Character {
  id: UUID;
  name: string;
  role: CharacterRole;
  personality: Record<string, unknown>;
  knowledge: string;
  position: { x: number; y: number };
  sprite?: string;
  expression_state?: ExpressionState;
  alerted?: boolean;
  reputation_score: number;
  investigation_id?: UUID;
  created_at?: string;
  dialogue_background_url?: string;
  image_url?: string;
  portrait_prompt?: string;
  dialog_background_prompt?: string;
  location_description?: string;
  is_culprit?: boolean;
}

export interface DialogEntry {
  id: UUID;
  character_id: UUID;
  user_input: string;
  character_reply: string;
  timestamp: string;
  clickable_keywords?: string[];
  reputation_impact?: number;
  truth_likelihood?: number;
  investigation_id?: UUID;
  created_at?: string;
}

export interface Lead {
  id: UUID;
  description: string;
  source_pnj?: UUID;
  confidence_level?: number;
  resolved?: boolean;
  discovered_at?: string;
  investigation_id?: UUID;
}

export interface DiscoveredClue {
  id: UUID;
  investigation_id: UUID;
  character_id: UUID;
  dialog_id: UUID;
  clue_text: string;
  importance_level: number;
  discovered_at: string;
  clue_type: ClueType;
}

export interface InvestigationAsset {
  id: UUID;
  investigation_id: UUID;
  asset_name: string;
  asset_url: string;
  asset_type: AssetType;
  created_at?: string;
}

export interface GeneratedAsset {
  id: UUID;
  investigation_id: UUID;
  asset_name: string;
  image_url: string;
  asset_type: AssetType;
  prompt: string;
  style?: string;
  characterId?: string;
  locationContext?: string;
  created_at?: string;
}

export interface Asset {
  name: string;
  url: string;
  type: AssetType;
  characterId?: string;
}

export interface Clue {
  id: UUID;
  investigation_id: UUID;
  name: string;
  description?: string;
  image_url?: string;
  discovered_by?: UUID;
  location?: string;
  created_at?: string;
  image_prompt?: string;
}

// Utility function to validate UUID
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Type conversion utilities
export const convertSupabaseCharacter = (char: any): Character => ({
  id: char.id,
  name: char.name,
  role: char.role as CharacterRole,
  personality: char.personality || {},
  knowledge: char.knowledge || '',
  position: char.position || { x: 0, y: 0 },
  sprite: char.sprite,
  expression_state: char.expression_state as ExpressionState,
  alerted: char.alerted || false,
  reputation_score: char.reputation_score || 50,
  investigation_id: char.investigation_id,
  created_at: char.created_at,
  dialogue_background_url: char.dialogue_background_url,
  image_url: char.image_url,
  portrait_prompt: char.portrait_prompt,
  dialog_background_prompt: char.dialog_background_prompt,
  location_description: char.location_description,
  is_culprit: char.is_culprit || false,
});

export const convertSupabaseInvestigation = (inv: any): Investigation => ({
  id: inv.id,
  title: inv.title,
  prompt: inv.prompt,
  characters: inv.characters ? inv.characters.map(convertSupabaseCharacter) : [],
  created_by: inv.created_by,
  created_at: inv.created_at,
  status: inv.status as InvestigationStatus,
  player_role: inv.player_role,
  background_url: inv.background_url,
  background_prompt: inv.background_prompt,
  player_image_url: inv.player_image_url,
  accused_character_id: inv.accused_character_id,
  accusation_made: inv.accusation_made || false,
  game_result: inv.game_result as GameResult || 'ongoing',
  culprit_character_id: inv.culprit_character_id,
  accusation_timestamp: inv.accusation_timestamp,
  clues: inv.clues ? inv.clues.map((clue: any) => ({
    id: clue.id,
    investigation_id: clue.investigation_id,
    name: clue.name,
    description: clue.description,
    image_url: clue.image_url,
    discovered_by: clue.discovered_by,
    location: clue.location,
    created_at: clue.created_at,
    image_prompt: clue.image_prompt
  })) : [],
});

export const convertSupabaseAsset = (asset: any): Asset => ({
  name: asset.asset_name,
  url: asset.cloudinary_url,
  type: asset.asset_type as AssetType,
  characterId: asset.character_id
});
