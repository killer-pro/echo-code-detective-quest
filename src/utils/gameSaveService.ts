
import { supabase } from '../integrations/supabase/client';
import { Investigation, DialogEntry, Lead } from '../types';

interface GameSaveData {
  id?: string;
  investigation_id: string;
  player_position: { x: number; y: number };
  game_state: {
    dialogHistory: DialogEntry[];
    discoveredLeads: Lead[];
    reputation: { [characterId: string]: number };
    charactersAlerted: { [characterId: string]: boolean };
  };
  last_played_at: string;
  player_name?: string;
  player_role?: string;
}

export class GameSaveService {
  static async saveGame(
    investigation: Investigation,
    playerPosition: { x: number; y: number },
    dialogHistory: DialogEntry[],
    discoveredLeads: Lead[],
    reputation: { [characterId: string]: number },
    charactersAlerted: { [characterId: string]: boolean } = {}
  ): Promise<string> {
    try {
      const saveData: GameSaveData = {
        investigation_id: investigation.id,
        player_position: playerPosition,
        game_state: {
          dialogHistory,
          discoveredLeads,
          reputation,
          charactersAlerted
        },
        last_played_at: new Date().toISOString(),
        player_name: 'Enquêteur',
        player_role: investigation.player_role || 'enquêteur'
      };

      const { data, error } = await supabase
        .from('game_saves')
        .insert(saveData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Partie sauvegardée avec succès');
      return data.id;
    } catch (error) {
      console.error('💥 Erreur sauvegarde partie:', error);
      throw error;
    }
  }

  static async loadGame(saveId: string): Promise<GameSaveData | null> {
    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('id', saveId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('💥 Erreur chargement partie:', error);
      return null;
    }
  }

  static async getRecentSaves(limit: number = 10): Promise<GameSaveData[]> {
    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select(`
          *,
          investigations(title)
        `)
        .order('last_played_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('💥 Erreur récupération sauvegardes:', error);
      return [];
    }
  }

  static async deleteSave(saveId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('game_saves')
        .delete()
        .eq('id', saveId);

      if (error) throw error;
      console.log('✅ Sauvegarde supprimée');
    } catch (error) {
      console.error('💥 Erreur suppression sauvegarde:', error);
      throw error;
    }
  }
}
