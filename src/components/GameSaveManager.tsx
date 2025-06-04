
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Play, Clock } from 'lucide-react';
import { GameSaveService, type GameSave } from '../utils/gameSaveService';
import { toast } from 'sonner';

interface GameSaveManagerProps {
  onLoadGame: (save: GameSave) => void;
}

const GameSaveManager: React.FC<GameSaveManagerProps> = ({ onLoadGame }) => {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      setLoading(true);
      const gameSaves = await GameSaveService.loadGameSaves();
      setSaves(gameSaves);
    } catch (error) {
      console.error('Erreur chargement sauvegardes:', error);
      toast.error('Erreur lors du chargement des sauvegardes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      return;
    }

    try {
      await GameSaveService.deleteSave(saveId);
      setSaves(prev => prev.filter(save => save.id !== saveId));
      toast.success('Sauvegarde supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleLoadGame = (save: GameSave) => {
    onLoadGame(save);
    toast.success(`Partie "${save.investigation_title}" chargée`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sauvegardes</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Sauvegardes</h2>
      
      {saves.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Aucune sauvegarde trouvée</p>
          <p className="text-sm text-gray-500">
            Les sauvegardes apparaîtront ici après avoir joué à une enquête
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {saves.map((save) => (
            <Card key={save.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">
                    {save.investigation_title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoadGame(save)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Charger
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSave(save.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">
                    {save.game_state.dialogHistory.length} dialogues
                  </Badge>
                  <Badge variant="secondary">
                    {save.game_state.discoveredLeads.length} indices
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Dernière partie: {formatDate(save.last_played_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameSaveManager;
