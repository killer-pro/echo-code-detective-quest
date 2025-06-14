import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Wand2, Users, MapPin, Zap } from 'lucide-react';
import { investigationAgents } from '../utils/investigationAgents';
import { type Investigation, type Character, type CharacterRole, type ExpressionState } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Interfaces for Gemini responses
interface GeminiCharacter {
  name: string;
  role: string;
  personality?: Record<string, any>; // Using Record<string, any> because the structure of personality traits is dynamic and depends on AI output
  knowledge?: string;
  reputation_score?: number;
  position?: { x: number; y: number };
  location_description?: string;
  portrait_prompt?: string;
  dialog_background_prompt?: string;
}

interface GeminiClue {
  name: string;
  description?: string;
  image_prompt?: string;
  location?: string;
}

interface GeminiInvestigationData {
  title: string;
  description: string;
  context: string;
  characters: GeminiCharacter[];
  clues?: GeminiClue[];
  background_prompt?: string;
}

interface PromptGeneratorProps {
  onPromptUpdate: (prompt: string) => void;
  onInvestigationGenerated?: (investigation: Investigation) => void;
  prompt: string;
}

// Constants for validation
const validRoles: CharacterRole[] = ['témoin', 'suspect', 'enquêteur', 'innocent'];
const validExpressionStates: ExpressionState[] = ['neutre', 'nerveux', 'en_colère', 'coopératif', 'méfiant'];

const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  onPromptUpdate,
  onInvestigationGenerated,
  prompt: externalPrompt
}) => {
  const [prompt, setPrompt] = useState(externalPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedInvestigation, setGeneratedInvestigation] = useState<Investigation | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  useEffect(() => {
    setPrompt(externalPrompt);
  }, [externalPrompt]);

  const templates = [
    {
      id: 'manor',
      title: 'Manor Mystery',
      description: 'Theft in a large property with suspicious characters',
      prompt: 'A precious jewel was stolen during a reception in a Victorian manor. Guests and staff are all suspects.'
    },
    {
      id: 'office',
      title: 'Corporate Crime',
      description: 'Investigation in a modern corporate environment',
      prompt: 'Confidential documents have disappeared from a tech company. Industrial espionage is suspected.'
    },
    {
      id: 'school',
      title: 'School Incident',
      description: 'Mystery in an educational institution',
      prompt: 'A valuable object disappeared from the headmaster\'s office of a prestigious high school during exams.'
    },
    {
      id: 'village',
      title: 'Village Secret',
      description: 'Investigation in a small rural community',
      prompt: 'A strange event disrupts the tranquility of a small village where everyone knows each other.'
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

  // Base prompt: Basic investigation with characters and clues
  const baseInvestigationPrompt = `
Create a procedural investigation based on this prompt: "${prompt}"

RESPOND ONLY IN VALID JSON with this EXACT structure:
{
  "title": "Investigation Title",
  "description": "Detailed description of the mystery to solve",
  "context": "Initial narrative context explaining the starting situation",
  "background_prompt": "2D game background, side view, [description of the main location], cartoon style, flat design, game environment",
  "characters": [
    {
      "name": "Character Name",
      "role": "témoin|suspect|innocent",
      "personality": { // Using Record<string, any> because the structure of personality traits is dynamic and depends on AI output
        "traits": ["trait1", "trait2"],
        "secrets": "character's secrets",
        "motivations": "character's motivations",
        "appearance": "detailed physical description of the character"
      },
      "knowledge": "What the character knows about the investigation",
      "position": {"x": 200, "y": 150},
      "reputation_score": 50,
      "location_description": "Description of the location where this character is",
      "portrait_prompt": "2D character sprite, front view, [detailed physical description], cartoon style, game character, flat design",
      "dialog_background_prompt": "2D game background, [character's location], cartoon style, interior/exterior scene, flat design"
    }
  ],
  "clues": [
    {
      "name": "Clue Name",
      "description": "Detailed description of the clue and its importance",
      "location": "Where this clue is located",
      "image_prompt": "2D game object, [description of the object], simple flat design, cartoon style, game prop"
    }
  ]
}

RULES:
- Create EXACTLY 3-5 characters with varied roles
- Create EXACTLY 2-4 important clues
- Positions must be between x:100-700 and y:100-500
- Each character must have a different location (living room, kitchen, office, garden, etc.)
- Clues must be consistent with the story
- ALL image prompts must use "2D", "cartoon style", "flat design"
`;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep('Initialisation des agents IA...');
    
    try {
      setGenerationStep('Agent histoire: Création du scénario...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGenerationStep('Agent personnages: Développement des caractères...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGenerationStep('Agent indices: Génération des preuves...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGenerationStep('Agent logique: Vérification de la cohérence...');
      
      // Utiliser le nouveau système d'agents
      const baseInvestigation = await investigationAgents.generateInvestigationWithAgents(prompt);
      
      setGenerationStep('Finalisation de l\'enquête...');
      
      const investigationId = uuidv4();
      
      const formattedInvestigation: Investigation = {
        id: investigationId,
        title: baseInvestigation.title || 'Nouvelle Enquête Générée',
        description: baseInvestigation.description || 'Pas de description.',
        context: baseInvestigation.context || 'Pas de contexte.',
        prompt: prompt.trim(),
        characters: baseInvestigation.characters.map((char: any, index: number) => {
          return {
            id: uuidv4(),
            investigation_id: investigationId,
            name: char.name || 'Personnage Sans Nom',
            role: validRoles.includes(char.role as CharacterRole) ? char.role as CharacterRole : 'témoin',
            personality: char.personality || {},
            knowledge: char.knowledge || '',
            reputation_score: char.reputation_score || 50,
            position: char.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
            sprite: 'character',
            expression_state: 'neutre' as ExpressionState,
            alerted: false,
            is_culprit: char.is_culprit || false,
            portrait_prompt: char.portrait_prompt || `2D character sprite, front view, ${char.name}, cartoon style, game character`,
            dialog_background_prompt: char.dialog_background_prompt || `2D game background, ${char.location_description || 'generic location'}, cartoon style`,
            location_description: char.location_description || `Location of ${char.name}`,
          };
        }),
        status: 'en_cours',
        assetPrompts: [],
        clues: baseInvestigation.clues?.map((clue: any) => {
          return {
            id: uuidv4(),
            investigation_id: investigationId,
            name: clue.name,
            description: clue.description || '',
            image_prompt: clue.image_prompt || `2D game object, ${clue.name}, simple flat design, cartoon style`,
            location: clue.location || '',
          };
        }) || [],
        background_prompt: baseInvestigation.background_prompt || `2D game background, generic investigation, cartoon style, flat design`,
      };

      console.log('✅ Investigation générée avec système d\'agents:', formattedInvestigation);

      setGeneratedInvestigation(formattedInvestigation);
      if (onInvestigationGenerated) {
        onInvestigationGenerated(formattedInvestigation);
      }
    } catch (error) {
      console.error('Error during agent generation:', error);
      alert(`Erreur lors de la génération: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Predefined Templates */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Scénarios Prédéfinis</h3>
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

      {/* Custom Input Area */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Ou Créez Votre Propre Scénario</h3>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Décrivez Votre Enquête
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
            
            {/* Modified div for responsiveness */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="text-sm text-gray-400">
                <p>🤖 <strong>Nouveau:</strong> Système d'agents IA pour plus de cohérence</p>
                <p>🔄 Retry automatique en cas d'erreur</p>
                <p>🧠 Contexte partagé entre personnages</p>
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {generationStep || 'Génération...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Générer avec Agents IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Personnages Cohérents</h4>
              <p className="text-gray-400 text-sm">Système d'agents pour des relations logiques entre personnages</p>
            </div>
            <div>
              <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Contexte Partagé</h4>
              <p className="text-gray-400 text-sm">Les personnages connaissent les déclarations des autres</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Retry Automatique</h4>
              <p className="text-gray-400 text-sm">Système robuste avec gestion d'erreurs avancée</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Generated Investigation */}
      {generatedInvestigation && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Investigation Générée par Agents IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-purple-300 font-bold mb-2">📖 {generatedInvestigation.title}</h4>
              <p className="text-gray-300 text-sm mb-3">{generatedInvestigation.description}</p>
              <p className="text-gray-400 text-xs">{generatedInvestigation.context}</p>
            </div>
            
            <div>
              <h5 className="text-green-300 font-bold mb-2">👥 Personnages ({generatedInvestigation.characters.length}):</h5>
              {generatedInvestigation.characters.map((char) => (
                <div key={char.id} className="ml-4 mt-2 p-3 bg-slate-600 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-purple-300">{char.name}</span>
                    <Badge variant="outline" className="text-xs">{char.role}</Badge>
                    {char.is_culprit && <Badge className="bg-red-600 text-xs">COUPABLE</Badge>}
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{char.knowledge}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Localisation:</strong> {char.location_description}</div>
                    {char.personality.alibi && <div><strong>Alibi:</strong> {char.personality.alibi}</div>}
                  </div>
                </div>
              ))}
            </div>

            {generatedInvestigation.clues && generatedInvestigation.clues.length > 0 && (
              <div>
                <h5 className="text-yellow-300 font-bold mb-2">🔍 Indices ({generatedInvestigation.clues.length}):</h5>
                {generatedInvestigation.clues.map((clue) => (
                  <div key={clue.id} className="ml-4 mt-2 p-3 bg-slate-600 rounded">
                    <div className="font-bold text-yellow-300 mb-1">{clue.name}</div>
                    <p className="text-gray-400 text-xs mb-2">{clue.description}</p>
                    <div className="text-xs text-gray-500">
                      <div><strong>Localisation:</strong> {clue.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptGenerator;
