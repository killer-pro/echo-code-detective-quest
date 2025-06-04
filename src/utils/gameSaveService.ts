
import { supabase } from '../integrations/supabase/client';
import { Investigation, DialogEntry, Lead } from '../types';

export interface GameSave {
  id: string;
  investigation_id: string;
  player_position: { x: number; y: number };
  game_state: {
    dialogHistory: DialogEntry[];
    discoveredLeads: Lead[];
    reputation: { [characterId: string]: number };
    charactersAlerted: { [characterId: string]: boolean };
  };
  created_at: string;
  last_played_at: string;
  investigation_title: string;
}

export class GameSaveService {
  static async saveGame(
    investigation: Investigation,
    playerPosition: { x: number; y: number },
    dialogHistory: DialogEntry[],
    discoveredLeads: Lead[],
    reputation: { [characterId: string]: number },
    charactersAlerted: { [characterId: string]: boolean }
  ): Promise<void> {
    try {
      console.log('💾 Sauvegarde de la partie...');
      
      // Pour l'instant, on sauvegarde dans le localStorage
      // TODO: Créer la table game_saves dans Supabase si nécessaire
      const saveData: Omit<GameSave, 'id' | 'created_at' | 'last_played_at'> = {
        investigation_id: investigation.id,
        player_position: playerPosition,
        game_state: {
          dialogHistory,
          discoveredLeads,
          reputation,
          charactersAlerted
        },
        investigation_title: investigation.title
      };

      const existingSaves = this.getLocalSaves();
      const saveIndex = existingSaves.findIndex(save => save.investigation_id === investigation.id);
      
      const fullSaveData: GameSave = {
        ...saveData,
        id: saveIndex >= 0 ? existingSaves[saveIndex].id : `save_${Date.now()}`,
        created_at: saveIndex >= 0 ? existingSaves[saveIndex].created_at : new Date().toISOString(),
        last_played_at: new Date().toISOString()
      };

      if (saveIndex >= 0) {
        existingSaves[saveIndex] = fullSaveData;
      } else {
        existingSaves.push(fullSaveData);
      }

      localStorage.setItem('gameSaves', JSON.stringify(existingSaves));
      console.log('✅ Partie sauvegardée localement');
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error);
      throw error;
    }
  }

  static async loadGameSaves(): Promise<GameSave[]> {
    try {
      console.log('📖 Chargement des sauvegardes...');
      
      // Pour l'instant, charger depuis localStorage
      // TODO: Charger depuis Supabase quand la table sera créée
      const saves = this.getLocalSaves();
      console.log(`✅ ${saves.length} sauvegardes trouvées`);
      return saves;
    } catch (error) {
      console.error('💥 Erreur chargement sauvegardes:', error);
      return [];
    }
  }

  static async deleteSave(saveId: string): Promise<void> {
    try {
      console.log('🗑️ Suppression sauvegarde:', saveId);
      
      const saves = this.getLocalSaves();
      const filteredSaves = saves.filter(save => save.id !== saveId);
      localStorage.setItem('gameSaves', JSON.stringify(filteredSaves));
      
      console.log('✅ Sauvegarde supprimée');
    } catch (error) {
      console.error('💥 Erreur suppression:', error);
      throw error;
    }
  }

  private static getLocalSaves(): GameSave[] {
    try {
      const saves = localStorage.getItem('gameSaves');
      return saves ? JSON.parse(saves) : [];
    } catch (error) {
      console.error('💥 Erreur lecture localStorage:', error);
      return [];
    }
  }
}
