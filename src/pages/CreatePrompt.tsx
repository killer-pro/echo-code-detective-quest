
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Loader2, ArrowLeft, Wand2, Users, Map } from 'lucide-react';
import { geminiAPI } from '../api/gemini';
import { supabase } from '../integrations/supabase/client';
import { useGame } from '../context/GameContext';
import SceneGenerator from '../components/SceneGenerator';
import { toast } from 'sonner';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvestigation, setGeneratedInvestigation] = useState<any>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);

  const generateInvestigation = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer un prompt pour votre enquête');
      return;
    }

    setIsGenerating(true);
    try {
      const investigation = await geminiAPI.generateInvestigation(prompt);
      console.log('Enquête générée:', investigation);
      setGeneratedInvestigation(investigation);
      toast.success('Enquête générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération de l\'enquête');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGame = async () => {
    if (!generatedInvestigation) return;

    setIsStartingGame(true);
    try {
      // Sauvegarder l'enquête dans Supabase
      const { data: investigationData, error: investigationError } = await supabase
        .from('investigations')
        .insert({
          title: generatedInvestigation.title,
          prompt: prompt,
          status: 'en_cours' as const,
          description: generatedInvestigation.description
        })
        .select()
        .single();

      if (investigationError) {
        throw investigationError;
      }

      // Préparer les personnages avec le bon format
      const charactersData = generatedInvestigation.characters.map((char: any) => ({
        investigation_id: investigationData.id,
        name: char.name,
        role: char.role,
        personality: typeof char.personality === 'string' ? JSON.parse(char.personality) : char.personality,
        knowledge: char.knowledge,
        expression_state: 'neutre' as const,
        reputation_score: char.reputation_score || 50,
        alerted: false,
        position: typeof char.position === 'string' ? JSON.parse(char.position) : char.position,
        sprite: 'default'
      }));

      // Sauvegarder les personnages
      const { data: charactersResponse, error: charactersError } = await supabase
        .from('characters')
        .insert(charactersData)
        .select();

      if (charactersError) {
        throw charactersError;
      }

      // Convertir au format attendu par l'application
      const formattedCharacters = charactersResponse?.map(char => ({
        id: char.id,
        investigation_id: char.investigation_id,
        name: char.name,
        role: char.role,
        personality: typeof char.personality === 'string' ? JSON.parse(char.personality) : char.personality,
        knowledge: char.knowledge,
        expression_state: char.expression_state,
        reputation_score: char.reputation_score,
        alerted: char.alerted,
        position: typeof char.position === 'string' ? JSON.parse(char.position) : char.position,
        sprite: char.sprite || 'default',
        created_at: char.created_at
      })) || [];

      const finalInvestigation = {
        id: investigationData.id,
        title: investigationData.title,
        prompt: investigationData.prompt,
        status: investigationData.status,
        description: investigationData.description,
        created_at: investigationData.created_at,
        characters: formattedCharacters
      };

      // Mettre à jour le contexte global
      dispatch({ type: 'SET_INVESTIGATION', payload: finalInvestigation });
      
      toast.success('Enquête sauvegardée !');
      navigate('/game');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'enquête');
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleAssetsGenerated = (assets: any[]) => {
    console.log('Assets générés:', assets);
    toast.success(`${assets.length} assets générés pour votre scène`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Générateur d'Enquête</h1>
            <p className="text-gray-400 text-sm">Créez votre mystère personnalisé avec l'IA</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panneau de génération */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Génération d'Enquête
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Décrivez votre enquête
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Une enquête dans un manoir victorien où le majordome a été retrouvé mort dans la bibliothèque. Les suspects incluent la famille propriétaire et les domestiques..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  onClick={generateInvestigation}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Générer l'enquête
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Génération de scène */}
            {generatedInvestigation && (
              <SceneGenerator 
                investigation={generatedInvestigation}
                onAssetsGenerated={handleAssetsGenerated}
              />
            )}
          </div>

          {/* Prévisualisation */}
          <div className="space-y-6">
            {generatedInvestigation ? (
              <>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{generatedInvestigation.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{generatedInvestigation.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        <Users className="w-3 h-3 mr-1" />
                        {generatedInvestigation.characters?.length || 0} personnages
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                        <Map className="w-3 h-3 mr-1" />
                        Scène générée
                      </Badge>
                    </div>

                    <Button
                      onClick={handleStartGame}
                      disabled={isStartingGame}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isStartingGame ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Lancement...
                        </>
                      ) : (
                        'Commencer l\'enquête'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Aperçu des personnages */}
                {generatedInvestigation.characters && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Personnages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {generatedInvestigation.characters.map((character: any, index: number) => (
                          <div key={index} className="bg-slate-700 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">{character.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {character.role}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{character.knowledge}</p>
                            {character.personality && (
                              <div className="text-xs text-gray-500">
                                Traits: {typeof character.personality === 'string' 
                                  ? character.personality.substring(0, 50) + '...'
                                  : JSON.stringify(character.personality).substring(0, 50) + '...'
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700 border-dashed">
                <CardContent className="p-12 text-center">
                  <Wand2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Aucune enquête générée
                  </h3>
                  <p className="text-gray-500">
                    Entrez un prompt pour commencer à générer votre enquête personnalisée
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
