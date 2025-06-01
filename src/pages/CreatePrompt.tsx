
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PromptGenerator from '../components/PromptGenerator';
import SceneGenerator from '../components/SceneGenerator';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Play, Users, MapPin, Palette } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { Investigation } from '../types';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const [generatedInvestigation, setGeneratedInvestigation] = useState<any>(null);
  const [generatedAssets, setGeneratedAssets] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSceneGenerator, setShowSceneGenerator] = useState(false);

  const handleInvestigationGenerated = (investigation: any) => {
    console.log('Enquête générée:', investigation);
    setGeneratedInvestigation(investigation);
    setShowSceneGenerator(true);
  };

  const handleAssetsGenerated = (assets: any[]) => {
    console.log('Assets générés:', assets);
    setGeneratedAssets(assets);
  };

  const handleStartGame = async () => {
    if (!generatedInvestigation) return;

    setIsSaving(true);
    try {
      // Sauvegarde en base de données
      const { data: investigationData, error: investigationError } = await supabase
        .from('investigations')
        .insert({
          title: generatedInvestigation.title,
          prompt: generatedInvestigation.description,
          status: 'en_cours' as const
        })
        .select()
        .single();

      if (investigationError) throw investigationError;

      // Sauvegarde des personnages
      const charactersToInsert = generatedInvestigation.characters.map((char: any) => ({
        investigation_id: investigationData.id,
        name: char.name,
        role: char.role,
        personality: char.personality,
        knowledge: char.knowledge,
        reputation_score: char.reputation_score,
        position: char.position,
        sprite: 'character'
      }));

      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .insert(charactersToInsert)
        .select();

      if (charactersError) throw charactersError;

      // Mise à jour du state global avec le bon typage
      const investigation: Investigation = {
        id: investigationData.id,
        title: investigationData.title,
        prompt: investigationData.prompt,
        status: 'en_cours' as const,
        description: generatedInvestigation.description,
        characters: charactersData.map(char => ({
          id: char.id,
          investigation_id: char.investigation_id,
          name: char.name,
          role: char.role as 'témoin' | 'suspect' | 'enquêteur' | 'innocent',
          personality: char.personality,
          knowledge: char.knowledge,
          expression_state: 'neutre' as const,
          reputation_score: char.reputation_score || 50,
          alerted: false,
          position: char.position,
          sprite: char.sprite || 'character',
          created_at: char.created_at
        }))
      };

      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });
      navigate('/game');

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // En cas d'erreur, on peut quand même jouer avec les données temporaires
      const investigation: Investigation = {
        id: 'temp_' + Date.now(),
        title: generatedInvestigation.title,
        prompt: generatedInvestigation.description,
        status: 'en_cours' as const,
        description: generatedInvestigation.description,
        characters: generatedInvestigation.characters.map((char: any) => ({
          id: char.id,
          investigation_id: 'temp_' + Date.now(),
          name: char.name,
          role: char.role as 'témoin' | 'suspect' | 'enquêteur' | 'innocent',
          personality: char.personality,
          knowledge: char.knowledge,
          expression_state: 'neutre' as const,
          reputation_score: char.reputation_score || 50,
          alerted: false,
          position: char.position,
          sprite: char.sprite || 'character'
        }))
      };
      
      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });
      navigate('/game');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Créateur d'Enquête</h1>
              <p className="text-gray-400">Générez votre mystère avec l'IA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Zone de génération */}
          <div className="lg:col-span-2 space-y-6">
            <PromptGenerator onInvestigationGenerated={handleInvestigationGenerated} />
            
            {showSceneGenerator && generatedInvestigation && (
              <SceneGenerator 
                investigation={generatedInvestigation}
                onAssetsGenerated={handleAssetsGenerated}
              />
            )}
          </div>

          {/* Aperçu de l'enquête générée */}
          <div className="lg:col-span-1 space-y-6">
            {generatedInvestigation ? (
              <>
                <Card className="bg-slate-800 border-slate-700 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Enquête Générée
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {generatedInvestigation.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {generatedInvestigation.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Users className="w-4 h-4" />
                        {generatedInvestigation.characters?.length || 0} personnages
                      </div>
                      
                      {generatedAssets.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Palette className="w-4 h-4" />
                          {generatedAssets.length} assets visuels
                        </div>
                      )}
                      
                      {generatedInvestigation.characters?.map((char: any, index: number) => (
                        <div key={index} className="bg-slate-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium">{char.name}</span>
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                              {char.role}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">
                            {char.knowledge?.substring(0, 80)}...
                          </p>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleStartGame}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isSaving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Préparation...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Commencer l'Enquête
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">
                    En attente de génération
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Choisissez un template ou décrivez votre propre scénario pour commencer
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
