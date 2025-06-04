
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Brain, 
  Users, 
  MapPin, 
  Clock, 
  Lightbulb, 
  Play,
  Sparkles,
  Target,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvestigationCreator } from '../components/create-prompt/hooks/useInvestigationCreator';
import InvestigationPreview from '../components/create-prompt/InvestigationPreview';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const {
    isStartingGame,
    createSimpleInvestigation,
    startGame,
  } = useInvestigationCreator();

  const [prompt, setPrompt] = React.useState('');
  const [showExamples, setShowExamples] = React.useState(false);

  const examplePrompts = [
    {
      category: "Mystère Classique",
      title: "Meurtre au Manoir",
      prompt: "Un riche héritier est retrouvé mort dans sa bibliothèque lors d'une soirée familiale. Les invités sont sa sœur jalouse, son neveu endetté, et le majordome fidèle.",
      complexity: "Facile",
      characters: 3
    },
    {
      category: "Crime Moderne",
      title: "Vol en Entreprise", 
      prompt: "Des documents confidentiels ont disparu d'une startup technologique. Enquêtez parmi l'équipe : le fondateur stressé, la développeuse ambitieuse, et l'investisseur mystérieux.",
      complexity: "Moyen",
      characters: 3
    },
    {
      category: "Mystère Scolaire",
      title: "Sabotage au Lycée",
      prompt: "Le projet scientifique gagnant du concours a été sabotage la veille de la finale. Interrogez l'élève perfectionniste, le rival jaloux, et le professeur partial.",
      complexity: "Facile", 
      characters: 3
    },
    {
      category: "Intrigue Historique",
      title: "Trahison à la Cour",
      prompt: "Des secrets d'État ont été vendus à l'ennemi dans un château du 18ème siècle. Soupçonnez la dame de compagnie ambitieuse, le garde loyal, et le diplomate étranger.",
      complexity: "Difficile",
      characters: 3
    }
  ];

  const handleCreateInvestigation = async () => {
    if (!prompt.trim()) return;
    
    await createSimpleInvestigation(prompt);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Facile': return 'bg-green-500';
      case 'Moyen': return 'bg-yellow-500';
      case 'Difficile': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-blue-400" />
            Créateur d'Enquêtes IA
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Décrivez votre enquête et laissez l'IA créer un mystère immersif avec des personnages uniques et une intrigue captivante.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Panneau de création */}
          <div className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Créer Votre Enquête
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Décrivez votre enquête
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Un vol mystérieux dans un musée d'art. Les suspects incluent le gardien de nuit, la conservatrice ambitieuse, et un collectionneur privé..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 min-h-[120px]"
                    rows={6}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    💡 Incluez le contexte, les personnages potentiels, et l'intrigue de base
                  </p>
                </div>

                <Button
                  onClick={handleCreateInvestigation}
                  disabled={!prompt.trim() || isStartingGame}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
                  size="lg"
                >
                  {isStartingGame ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Créer et Jouer
                    </div>
                  )}
                </Button>

                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Conseils pour une bonne enquête :
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Décrivez le crime ou mystère principal</li>
                    <li>• Mentionnez 3-4 personnages avec leurs motivations</li>
                    <li>• Ajoutez des détails sur le lieu et l'époque</li>
                    <li>• Créez des conflits entre les personnages</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bouton exemples */}
            <Button
              onClick={() => setShowExamples(!showExamples)}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showExamples ? 'Masquer' : 'Voir'} les exemples d'enquêtes
            </Button>
          </div>

          {/* Panneau d'exemples */}
          <div className="space-y-6">
            {showExamples && (
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-yellow-400" />
                    Exemples d'Enquêtes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examplePrompts.map((example, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                        onClick={() => setPrompt(example.prompt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {example.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getComplexityColor(example.complexity)} text-white text-xs`}>
                              {example.complexity}
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Users className="w-3 h-3" />
                              <span className="text-xs">{example.characters}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-white mb-2">{example.title}</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {example.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations sur les fonctionnalités */}
            <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Fonctionnalités du Jeu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Personnages IA</h4>
                      <p className="text-sm text-gray-300">Chaque personnage a une personnalité unique et réagit différemment selon vos questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Détection d'Indices</h4>
                      <p className="text-sm text-gray-300">L'IA détecte automatiquement les indices importants dans les conversations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Accusation Finale</h4>
                      <p className="text-sm text-gray-300">Une seule chance d'accuser le coupable - choisissez bien !</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Environnement Immersif</h4>
                      <p className="text-sm text-gray-300">Explorez des lieux générés par IA avec des personnages animés</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrompt;
