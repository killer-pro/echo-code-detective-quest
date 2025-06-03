
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Save, Trash2, Play, Clock } from 'lucide-react';
import { GameSaveService } from '../utils/gameSaveService';
import { useGame } from '../context/GameContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GameSave {
  id: string;
  investigation_id: string;
  last_played_at: string;
  player_name?: string;
  player_role?: string;
  investigations?: { title: string };
}

interface GameSaveManagerProps {
  onLoadGame?: (saveData: any) => void;
  showLoadOnly?: boolean;
}

const GameSaveManager: React.FC<GameSaveManagerProps> = ({ onLoadGame, showLoadOnly = false }) => {
  const { state, dispatch } = useGame();
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    setIsLoading(true);
    try {
      const recentSaves = await GameSaveService.getRecentSaves();
      setSaves(recentSaves);
    } catch (error) {
      console.error('Erreur chargement sauvegardes:', error);
      toast.error('Erreur lors du chargement des sauvegardes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGame = async () => {
    if (!state.currentInvestigation) {
      toast.error('Aucune enquête en cours');
      return;
    }

    setIsSaving(true);
    try {
      const charactersAlerted = state.currentInvestigation.characters.reduce((acc, char) => {
        acc[char.id] = char.alerted || false;
        return acc;
      }, {} as { [characterId: string]: boolean });

      await GameSaveService.saveGame(
        state.currentInvestigation,
        state.playerPosition,
        state.dialogHistory,
        state.discoveredLeads,
        state.reputation,
        charactersAlerted
      );

      toast.success('Partie sauvegardée !');
      await loadSaves();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadGame = async (saveId: string) => {
    try {
      const saveData = await GameSaveService.loadGame(saveId);
      if (saveData && onLoadGame) {
        onLoadGame(saveData);
        toast.success('Partie chargée !');
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    setDeletingId(saveId);
    try {
      await GameSaveService.deleteSave(saveId);
      toast.success('Sauvegarde supprimée');
      await loadSaves();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Save className="w-5 h-5" />
          Gestion des Sauvegardes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showLoadOnly && state.currentInvestigation && (
          <Button
            onClick={handleSaveGame}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder la partie
              </>
            )}
          </Button>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : saves.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Aucune sauvegarde trouvée</p>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Sauvegardes récentes</h4>
            {saves.map((save) => (
              <div key={save.id} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="text-white font-medium">
                      {save.investigations?.title || 'Enquête inconnue'}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {save.player_role || 'enquêteur'}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(save.last_played_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoadGame(save.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSave(save.id)}
                      disabled={deletingId === save.id}
                      className="text-red-400 hover:text-red-300"
                    >
                      {deletingId === save.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameSaveManager;
