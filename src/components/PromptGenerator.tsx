import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Wand2, Users, MapPin, Zap } from 'lucide-react';
import { geminiAPI } from '../api/gemini';
import { type Investigation, type Character, type AssetPrompt, type CharacterRole, type ExpressionState } from '../types';
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
      "portrait_prompt": "2D character sprite, front view, [detailed physical description], cartoon style, game character, flat design, simple shapes",
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
    setGenerationStep('Generating complete investigation...');
    
    try {
      // Generating the investigation with all prompts at once
      const investigationResponse = await geminiAPI.generateInvestigation(baseInvestigationPrompt) as GeminiInvestigationData;
      
      setGenerationStep('Assembling the investigation...');

      const investigationId = uuidv4();
      
      // Final assembly of the investigation
      const formattedInvestigation: Investigation = {
        id: investigationId,
        title: investigationResponse.title || 'New Generated Investigation',
        description: investigationResponse.description || 'No description.',
        context: investigationResponse.context || 'No context.',
        prompt: prompt.trim(),
        characters: investigationResponse.characters.map((char: GeminiCharacter, index: number) => {
          return {
            id: uuidv4(),
            investigation_id: investigationId,
            name: char.name || 'Unnamed Character',
            role: validRoles.includes(char.role as CharacterRole) ? char.role as CharacterRole : 'témoin',
            personality: char.personality || {},
            knowledge: char.knowledge || '',
            reputation_score: char.reputation_score || 50,
            position: char.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
            sprite: 'character',
            expression_state: 'neutre' as ExpressionState,
            alerted: false,
            portrait_prompt: char.portrait_prompt || `2D character sprite, front view, ${char.name}, cartoon style, game character`,
            dialog_background_prompt: char.dialog_background_prompt || `2D game background, ${char.location_description || 'generic location'}, cartoon style`,
            location_description: char.location_description || `Location of ${char.name}`,
          };
        }),
        status: 'en_cours',
        assetPrompts: [],
        clues: investigationResponse.clues?.map((clue: GeminiClue) => {
          return {
            id: uuidv4(),
            investigation_id: investigationId,
            name: clue.name,
            description: clue.description || '',
            image_prompt: clue.image_prompt || `2D game object, ${clue.name}, simple flat design, cartoon style`,
            location: clue.location || '',
          };
        }) || [],
        background_prompt: investigationResponse.background_prompt || `2D game background, generic investigation, cartoon style, flat design`,
      };

      console.log('✅ Investigation generated:', formattedInvestigation);

      setGeneratedInvestigation(formattedInvestigation);
      if (onInvestigationGenerated) {
        onInvestigationGenerated(formattedInvestigation);
      }
    } catch (error) {
      console.error('Error during generation:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Predefined Templates */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Predefined Scenarios</h3>
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
                  3-5 characters
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Input Area */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Or Create Your Own Scenario</h3>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Describe Your Investigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Describe the mystery you want to create... For example: 'A murder on a night train with 6 suspicious passengers' or 'Theft in a modern art gallery during an opening'"
              className="min-h-[120px] bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              disabled={isGenerating}
            />
            
            {/* Modified div for responsiveness */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="text-sm text-gray-400">
                <p>💡 The more details you provide, the richer the investigation</p>
                <p>✨ AI will automatically create all image prompts</p>
                <p>🎨 Optimized single-step generation</p>
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {generationStep || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Investigation
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
              <h4 className="text-white font-medium">Unique Characters</h4>
              <p className="text-gray-400 text-sm">Each character has a unique personality, secrets, and motivations</p>
            </div>
            <div>
              <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Immersive Environment</h4>
              <p className="text-gray-400 text-sm">An interactive world where every dialogue counts</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">Dynamic AI</h4>
              <p className="text-gray-400 text-sm">Characters react and evolve based on your interactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Generated Investigation */}
      {generatedInvestigation && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Generated Investigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-purple-300 font-bold mb-2">📖 {generatedInvestigation.title}</h4>
              <p className="text-gray-300 text-sm mb-3">{generatedInvestigation.description}</p>
              <p className="text-gray-400 text-xs">{generatedInvestigation.context}</p>
            </div>
            
            <div>
              <h5 className="text-blue-300 font-bold mb-2">🎨 Main Background:</h5>
              <p className="text-gray-300 text-xs bg-slate-600 p-2 rounded">{generatedInvestigation.background_prompt}</p>
            </div>
            
            <div>
              <h5 className="text-green-300 font-bold mb-2">👥 Characters ({generatedInvestigation.characters.length}):</h5>
              {generatedInvestigation.characters.map((char) => (
                <div key={char.id} className="ml-4 mt-2 p-3 bg-slate-600 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-purple-300">{char.name}</span>
                    <Badge variant="outline" className="text-xs">{char.role}</Badge>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{char.knowledge}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>Portrait:</strong> {char.portrait_prompt}</div>
                    <div><strong>Dialog Background:</strong> {char.dialog_background_prompt}</div>
                    <div><strong>Location:</strong> {char.location_description}</div>
                  </div>
                </div>
              ))}
            </div>

            {generatedInvestigation.clues && generatedInvestigation.clues.length > 0 && (
              <div>
                <h5 className="text-yellow-300 font-bold mb-2">🔍 Clues ({generatedInvestigation.clues.length}):</h5>
                {generatedInvestigation.clues.map((clue) => (
                  <div key={clue.id} className="ml-4 mt-2 p-3 bg-slate-600 rounded">
                    <div className="font-bold text-yellow-300 mb-1">{clue.name}</div>
                    <p className="text-gray-400 text-xs mb-2">{clue.description}</p>
                    <div className="text-xs text-gray-500">
                      <div><strong>Location:</strong> {clue.location}</div>
                      <div><strong>Image:</strong> {clue.image_prompt}</div>
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
