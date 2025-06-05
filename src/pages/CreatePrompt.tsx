
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
  Search,
  Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PromptGenerator from '../components/PromptGenerator';
import SceneGenerator from '../components/SceneGenerator';
import { useInvestigationCreator } from '../components/create-prompt/hooks/useInvestigationCreator';
import { type Investigation } from '../types';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const {
    isStartingGame,
    createSimpleInvestigation,
    startGame,
  } = useInvestigationCreator();

  const [prompt, setPrompt] = React.useState('');
  const [showExamples, setShowExamples] = React.useState(false);
  const [generatedInvestigation, setGeneratedInvestigation] = React.useState<Investigation | null>(null);
  const [generatedAssets, setGeneratedAssets] = React.useState<any[]>([]);

  const examplePrompts = [
    {
      category: "Classic Mystery",
      title: "Manor Murder",
      prompt: "A wealthy heir is found dead in his library during a family gathering. The guests are his jealous sister, his indebted nephew, and the loyal butler.",
      complexity: "Easy",
      characters: 3
    },
    {
      category: "Modern Crime",
      title: "Corporate Theft", 
      prompt: "Confidential documents have disappeared from a tech startup. Investigate among the team: the stressed founder, the ambitious developer, and the mysterious investor.",
      complexity: "Medium",
      characters: 3
    },
    {
      category: "School Mystery",
      title: "High School Sabotage",
      prompt: "The winning science project for the competition was sabotaged the night before the finale. Question the perfectionist student, the jealous rival, and the biased teacher.",
      complexity: "Easy", 
      characters: 3
    },
    {
      category: "Historical Intrigue",
      title: "Court Betrayal",
      prompt: "State secrets have been sold to the enemy in an 18th-century castle. Suspect the ambitious lady-in-waiting, the loyal guard, and the foreign diplomat.",
      complexity: "Hard",
      characters: 3
    }
  ];

  const handleCreateInvestigation = async () => {
    if (!prompt.trim()) return;
    
    await createSimpleInvestigation(prompt);
  };

  const handleInvestigationGenerated = (investigation: Investigation) => {
    console.log('📋 Investigation generated:', investigation);
    setGeneratedInvestigation(investigation);
  };

  const handleAssetsGenerated = (assets: any[]) => {
    console.log('🎨 Assets generated:', assets);
    setGeneratedAssets(assets);
  };

  const handleStartGame = async () => {
    if (!generatedInvestigation) return;
    
    console.log('🚀 Starting game with:', {
      investigation: generatedInvestigation.title,
      assets: generatedAssets.length
    });
    
    await startGame(generatedInvestigation, generatedAssets);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
            <Brain className="w-6 h-6 md:w-10 md:h-10 text-blue-400" />
            AI Investigation Creator
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Describe your investigation and let AI create an immersive mystery with unique characters and captivating plot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-w-7xl mx-auto">
          {/* Creation panel */}
          <div className="space-y-4 md:space-y-6">
            {!generatedInvestigation ? (
              <>
                {/* AI prompt generator */}
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                      <Wand2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      AI Investigation Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PromptGenerator 
                      onPromptUpdate={setPrompt}
                      onInvestigationGenerated={handleInvestigationGenerated}
                    />
                  </CardContent>
                </Card>

                {/* Quick creation */}
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      Or Create Quickly
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Describe your investigation quickly
                      </label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: A mysterious theft in an art museum. Suspects include the night guard, the ambitious curator, and a private collector..."
                        className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 min-h-[100px] md:min-h-[120px] text-sm"
                        rows={5}
                      />
                      <p className="text-xs md:text-sm text-gray-400 mt-2">
                        💡 Include context, potential characters, and basic plot
                      </p>
                    </div>

                    <Button
                      onClick={handleCreateInvestigation}
                      disabled={!prompt.trim() || isStartingGame}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 md:py-3 text-sm md:text-lg"
                      size="lg"
                    >
                      {isStartingGame ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 md:w-5 md:h-5" />
                          Create and Play Quickly
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Display generated investigation + asset generator
              <div className="space-y-4 md:space-y-6">
                <Card className="bg-green-900/20 border-green-700">
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                      ✅ Investigation Generated
                      <Badge className="bg-green-600 text-xs">Ready</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-lg md:text-xl font-bold text-green-300 mb-2">{generatedInvestigation.title}</h3>
                    <p className="text-gray-300 text-xs md:text-sm mb-3 leading-relaxed">{generatedInvestigation.description}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>👥 {generatedInvestigation.characters.length} characters</p>
                      <p>🔍 {generatedInvestigation.clues?.length || 0} clues</p>
                    </div>
                  </CardContent>
                </Card>

                <SceneGenerator 
                  investigation={generatedInvestigation}
                  onAssetsGenerated={handleAssetsGenerated}
                />

                {generatedAssets.length > 0 && (
                  <Card className="bg-blue-900/20 border-blue-700">
                    <CardContent className="p-4 md:p-6">
                      <Button
                        onClick={handleStartGame}
                        disabled={isStartingGame}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 md:py-4 text-sm md:text-lg"
                        size="lg"
                      >
                        {isStartingGame ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                            Starting game...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 md:w-6 md:h-6" />
                            Begin Investigation ({generatedAssets.length} assets ready)
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Examples button */}
            {!generatedInvestigation && (
              <Button
                onClick={() => setShowExamples(!showExamples)}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showExamples ? 'Hide' : 'Show'} investigation examples
              </Button>
            )}
          </div>

          {/* Examples panel */}
          <div className="space-y-4 md:space-y-6">
            {showExamples && !generatedInvestigation && (
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    Investigation Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {examplePrompts.map((example, index) => (
                      <div 
                        key={index}
                        className="p-3 md:p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                        onClick={() => setPrompt(example.prompt)}
                      >
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
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
                        <h4 className="font-semibold text-white mb-2 text-sm md:text-base">{example.title}</h4>
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                          {example.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game features info */}
            <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  Game Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm md:text-base">AI Characters</h4>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">Each character has a unique personality and reacts differently to your questions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm md:text-base">Clue Detection</h4>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">AI automatically detects important clues in conversations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm md:text-base">Final Accusation</h4>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">One chance to accuse the culprit - choose wisely!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm md:text-base">Immersive Environment</h4>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">Explore AI-generated locations with animated characters</p>
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
