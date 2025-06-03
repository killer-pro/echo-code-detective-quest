
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Wand2, Users, MapPin, Zap } from 'lucide-react';
import { geminiAPI } from '../api/gemini';
import { Investigation } from '../types';

interface PromptGeneratorProps {
  onPromptUpdate: (prompt: string) => void;
  onInvestigationGenerated?: (investigation: Investigation) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ 
  onPromptUpdate, 
  onInvestigationGenerated 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'manor',
      title: 'Mystère au Manoir',
      description: 'Vol dans une grande propriété avec personnages suspects',
      prompt: 'Un bijou précieux a été volé lors d\'une réception dans un manoir victorien. Les invités et le personnel sont tous suspects.'
    },
    {
      id: 'office',
      title: 'Crime en Entreprise',
      description: 'Enquête dans un environnement corporatif moderne',
      prompt: 'Des documents confidentiels ont disparu d\'une entreprise de technologie. L\'espionnage industriel est suspecté.'
    },
    {
      id: 'school',
      title: 'Incident Scolaire',
      description: 'Mystère dans un établissement d\'enseignement',
      prompt: 'Un objet de valeur a disparu du bureau du directeur d\'un lycée prestigieux pendant les examens.'
    },
    {
      id: 'village',
      title: 'Secret de Village',
      description: 'Enquête dans une petite communauté rurale',
      prompt: 'Un événement étrange perturbe la tranquillité d\'un petit village où tout le monde se connaît.'
    }
  ];

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template.id);
    setPrompt(template.prompt);
    onPromptUpdate(template.prompt);
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onPromptUpdate(value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const investigation = await geminiAPI.generateInvestigation(prompt);
      
      // Convertir la réponse en format Investigation avec types corrects
      const formattedInvestigation: Investigation = {
        id: `investigation-${Date.now()}`,
        title: investigation.title,
        description: investigation.description,
        context: investigation.context,
        prompt: prompt.trim(),
        characters: investigation.characters.map(char => ({
          ...char,
          role: char.role as 'témoin' | 'suspect' | 'enquêteur' | 'innocent' // Type assertion pour corriger le type
        })),
        status: 'en_cours',
        assetPrompts: investigation.assetPrompts
      };

      if (onInvestigationGenerated) {
        onInvestigationGenerated(formattedInvestigation);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Templates prédéfinis */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Scénarios prédéfinis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'bg-purple-600/20 border-purple-500' 
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {template.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-xs mb-2">{template.description}</p>
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  3-5 personnages
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Zone de saisie personnalisée */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Ou créez votre propre scénario</h3>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Décrivez votre enquête
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Décrivez le mystère que vous voulez créer... Par exemple: 'Un meurtre dans un train de nuit avec 6 passagers suspects' ou 'Vol dans une galerie d'art moderne pendant un vernissage'"
              className="min-h-[120px] bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              disabled={isGenerating}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <p>💡 Plus vous donnez de détails, plus l'enquête sera riche</p>
                <p>✨ L'IA créera automatiquement les personnages et leurs secrets</p>
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Générer l'enquête
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur le processus */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Personnages Uniques</h4>
              <p className="text-gray-400 text-sm">Chaque personnage a sa personnalité, ses secrets et ses motivations</p>
            </div>
            <div>
              <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Environnement Immersif</h4>
              <p className="text-gray-400 text-sm">Un monde interactif où chaque dialogue compte</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">IA Dynamique</h4>
              <p className="text-gray-400 text-sm">Les personnages réagissent et évoluent selon vos interactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptGenerator;
