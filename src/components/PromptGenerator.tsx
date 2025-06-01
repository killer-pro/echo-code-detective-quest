
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Wand2, Sparkles, Clock, MapPin } from 'lucide-react';

interface PromptGeneratorProps {
  onGenerateInvestigation: (prompt: string) => Promise<void>;
  isLoading?: boolean;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  onGenerateInvestigation,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState('');

  const examplePrompts = [
    "Un célèbre chef cuisinier disparaît mystérieusement de son restaurant étoilé la veille d'une inspection critique.",
    "Une bibliothécaire trouve un livre ancien qui semble changer de contenu chaque nuit.",
    "Le directeur d'une école privée est retrouvé inconscient dans son bureau, entouré de dossiers d'élèves déchirés.",
    "Un antiquaire respecté est accusé de vendre des objets volés, mais jure de son innocence.",
    "Une scientifique spécialisée en climatologie disparaît pendant une expédition en Arctique.",
  ];

  const handleGenerate = async () => {
    if (prompt.trim() && !isLoading) {
      await onGenerateInvestigation(prompt.trim());
    }
  };

  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Générateur d'enquête IA
          </CardTitle>
          <p className="text-gray-400">
            Décrivez le scénario d'enquête que vous souhaitez explorer. L'IA génèrera automatiquement 
            les personnages, les lieux et l'intrigue correspondante.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-white font-medium">Votre scénario d'enquête</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez votre enquête... (ex: Un vol mystérieux dans un musée, une disparition dans un petit village, etc.)"
              rows={4}
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
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

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Exemples d'enquêtes</CardTitle>
          <p className="text-gray-400 text-sm">
            Cliquez sur un exemple pour l'utiliser comme point de départ
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {examplePrompts.map((example, index) => (
              <Card 
                key={index}
                className="bg-slate-800 border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => useExamplePrompt(example)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {index % 3 === 0 && <Clock className="w-4 h-4 text-purple-400" />}
                      {index % 3 === 1 && <MapPin className="w-4 h-4 text-blue-400" />}
                      {index % 3 === 2 && <Sparkles className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Conseils pour de meilleures enquêtes</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-white font-medium">Éléments recommandés :</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Lieu spécifique</Badge>
                <Badge variant="secondary">Personnage central</Badge>
                <Badge variant="secondary">Événement déclencheur</Badge>
                <Badge variant="secondary">Mystère à résoudre</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium">Types d'enquêtes :</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-purple-400 border-purple-400">Disparition</Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">Vol/Cambriolage</Badge>
                <Badge variant="outline" className="text-green-400 border-green-400">Chantage</Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">Fraude</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptGenerator;
