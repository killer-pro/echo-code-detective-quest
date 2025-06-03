
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Wand2, Play } from 'lucide-react';
import PromptGenerator from '../components/PromptGenerator';
import SceneGenerator from '../components/SceneGenerator';
import { Investigation } from '../types';

const CreatePrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedInvestigation, setGeneratedInvestigation] = useState<Investigation | null>(null);
  const [showSceneGenerator, setShowSceneGenerator] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const handleInvestigationGenerated = (investigation: Investigation) => {
    console.log('🎯 Investigation générée:', investigation);
    setGeneratedInvestigation(investigation);
    setShowSceneGenerator(true);
  };

  const handleAssetsGenerated = (assets: { name: string; url: string; type: string }[]) => {
    console.log('🎨 Assets générés:', assets);
    // Les assets sont déjà ajoutés à l'AssetManager par SceneGenerator
  };

  const handleStartInvestigation = () => {
    if (!generatedInvestigation) return;

    console.log('🚀 Démarrage de l\'enquête:', generatedInvestigation.title);
    dispatch({ type: 'SET_INVESTIGATION', payload: generatedInvestigation });
    navigate('/game');
  };

  const handleCreateSimpleInvestigation = async () => {
    if (!prompt.trim()) return;

    const simpleInvestigation: Investigation = {
      id: `investigation-${Date.now()}`,
      title: 'Nouvelle Enquête',
      prompt: prompt.trim(),
      characters: [],
      status: 'en_cours'
    };

    dispatch({ type: 'SET_INVESTIGATION', payload: simpleInvestigation });
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-white">Créer une Enquête</h1>
        </div>

        {!generatedInvestigation ? (
          /* Étape 1: Génération de l'enquête */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Générateur d'Enquête IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PromptGenerator 
                  onPromptUpdate={setPrompt}
                  onInvestigationGenerated={handleInvestigationGenerated}
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ou créer une enquête simple</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-400 text-sm">
                  <p>💡 Vous pouvez aussi créer une enquête basique sans IA</p>
                  <p>✨ Vous pourrez ajouter des personnages manuellement plus tard</p>
                </div>
                
                <Button
                  onClick={handleCreateSimpleInvestigation}
                  disabled={!prompt.trim()}
                  variant="outline"
                  className="w-full"
                >
                  Créer Enquête Simple
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Étape 2: Génération des assets et finalisation */
          <div className="space-y-6">
            {/* Résumé de l'enquête générée */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Enquête Générée: {generatedInvestigation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-300">{generatedInvestigation.description}</p>
                  <div className="text-sm text-gray-400">
                    <p><strong>Contexte:</strong> {generatedInvestigation.context}</p>
                    <p><strong>Personnages:</strong> {generatedInvestigation.characters?.length || 0}</p>
                    <p><strong>Assets à générer:</strong> {generatedInvestigation.assetPrompts?.length || 0}</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleStartInvestigation}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Commencer l'Enquête
                    </Button>
                    
                    <Button
                      onClick={() => setGeneratedInvestigation(null)}
                      variant="outline"
                    >
                      Régénérer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Générateur de scène (optionnel) */}
            {showSceneGenerator && generatedInvestigation.assetPrompts && (
              <SceneGenerator
                investigation={generatedInvestigation}
                onAssetsGenerated={handleAssetsGenerated}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePrompt;
