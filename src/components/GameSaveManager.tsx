
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GameSaveService } from '../utils/gameSaveService';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface GameSave {
  id: string;
  investigation_id: string;
  player_position: { x: number; y: number };
  game_state: {
    dialogHistory: any[];
    discoveredLeads: any[];
    reputation: { [characterId: string]: number };
    charactersAlerted: { [characterId: string]: boolean };
  };
  last_played_at: string;
  player_name?: string;
  player_role?: string;
  investigations?: { title: string };
}

const GameSaveManager: React.FC = () => {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      const recentSaves = await GameSaveService.getRecentSaves();
      setSaves(recentSaves as GameSave[]);
    } catch (error) {
      console.error('Erreur chargement sauvegardes:', error);
      toast.error('Erreur lors du chargement des sauvegardes');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGame = async (save: GameSave) => {
    try {
      // Charger l'investigation complète
      const { data: investigation, error } = await supabase
        .from('investigations')
        .select(`
          *,
          characters(*)
        `)
        .eq('id', save.investigation_id)
        .single();

      if (error || !investigation) {
        throw new Error('Investigation introuvable');
      }

      // Charger l'état du jeu
      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });
      dispatch({ 
        type: 'LOAD_GAME_STATE', 
        payload: {
          dialogHistory: save.game_state.dialogHistory,
          discoveredLeads: save.game_state.discoveredLeads,
          reputation: save.game_state.reputation,
          playerPosition: save.player_position
        }
      });

      // Mettre à jour les états des personnages alertés
      if (save.game_state.charactersAlerted) {
        Object.entries(save.game_state.charactersAlerted).forEach(([characterId, alerted]) => {
          dispatch({
            type: 'UPDATE_CHARACTER_ALERTED_STATUS',
            payload: { characterId, alerted }
          });
        });
      }

      toast.success('Partie chargée avec succès !');
      navigate('/game');
    } catch (error) {
      console.error('Erreur chargement partie:', error);
      toast.error('Erreur lors du chargement de la partie');
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    try {
      await GameSaveService.deleteSave(saveId);
      setSaves(saves.filter(save => save.id !== saveId));
      toast.success('Sauvegarde supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des sauvegardes...</p>
      </div>
    );
  }

  if (saves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune sauvegarde</CardTitle>
          <CardDescription>
            Vous n'avez pas encore de parties sauvegardées. Commencez une nouvelle enquête !
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Parties sauvegardées</h3>
      
      <div className="grid gap-4">
        {saves.map((save) => (
          <Card key={save.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {save.investigations?.title || 'Investigation inconnue'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(save.last_played_at)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleLoadGame(save)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Reprendre
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSave(save.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>💬 {save.game_state.dialogHistory.length} dialogues</span>
                <span>🕵️ {save.game_state.discoveredLeads.length} indices</span>
                <span>👤 {save.player_role || 'Enquêteur'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameSaveManager;
