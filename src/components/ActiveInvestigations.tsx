
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Clock, Users } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Investigation {
  id: string;
  title: string;
  status: string;
  created_at: string;
  characters?: { id: string }[];
}

const ActiveInvestigations: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvestigations();
  }, []);

  const loadInvestigations = async () => {
    try {
      // Corrigé: spécifie explicitement la relation pour éviter l'ambiguïté
      const { data, error } = await supabase
        .from('investigations')
        .select(`
          id,
          title,
          status,
          created_at,
          characters!characters_investigation_id_fkey(id)
        `)
        .eq('status', 'en_cours')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erreur chargement investigations:', error);
        return;
      }

      setInvestigations(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueInvestigation = (investigationId: string) => {
    navigate(`/game/${investigationId}`);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Enquêtes en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (investigations.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Enquêtes en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Aucune enquête en cours. Créez votre première enquête !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="w-5 h-5" />
          Enquêtes en cours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {investigations.map((investigation) => (
          <div key={investigation.id} className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-white font-medium">{investigation.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                    {investigation.status}
                  </Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {investigation.characters?.length || 0} personnages
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(investigation.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleContinueInvestigation(investigation.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Continuer
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveInvestigations;
