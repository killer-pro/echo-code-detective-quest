import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Users, MapPin, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/client';
import { Investigation } from '../types';
import { investigationAgents } from '../utils/investigationAgents';
import { cloudinaryService } from '../utils/cloudinaryService';

interface PromptGeneratorProps {
  onInvestigationGenerated: (investigation: Investigation) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onInvestigationGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const quickPrompts = [
    "Un vol de bijoux dans un manoir isolé",
    "Un meurtre mystérieux lors d'une soirée de gala",
    "La disparition d'un scientifique renommé",
    "Une affaire de chantage dans un bureau d'avocats",
    "Un complot politique au sein d'une petite ville"
  ];

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer une description pour votre enquête');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Génération de l\'histoire...');

    try {
      console.log('🎬 Démarrage génération avec agents...');
      
      // Génération avec le système d'agents
      setGenerationStep('Création des personnages...');
      const investigationData = await investigationAgents.generateInvestigationWithAgents(prompt);
      
      console.log('✅ Investigation générée:', investigationData);

      // Sauvegarde en base de données
      setGenerationStep('Sauvegarde de l\'enquête...');
      const investigationId = uuidv4();
      
      const { error: investigationError } = await supabase
        .from('investigations')
        .insert({
          id: investigationId,
          title: investigationData.title,
          prompt: prompt,
          background_url: '', // Sera mis à jour après génération
          status: 'en_cours',
          player_role: 'enquêteur'
        });

      if (investigationError) {
        console.error('💥 Erreur sauvegarde investigation:', investigationError);
        throw investigationError;
      }

      // Génération et sauvegarde des assets avec retry
      setGenerationStep('Génération des images...');
      
      // Générer le background
      let backgroundUrl = '';
      try {
        const backgroundResponse = await cloudinaryService.generateAndUploadImage(
          investigationData.background_prompt || '2D game background, mysterious scene, cartoon style',
          `${investigationId}/background`
        );
        backgroundUrl = backgroundResponse.url;
      } catch (error) {
        console.warn('⚠️ Erreur génération background, utilisation fallback');
        backgroundUrl = 'https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Background';
      }

      // Sauvegarder les personnages avec retry pour les images
      const savedCharacters = [];
      for (const character of investigationData.characters) {
        setGenerationStep(`Génération image ${character.name}...`);
        
        let portraitUrl = '';
        let dialogBackgroundUrl = '';
        
        try {
          // Portrait avec retry
          const portraitResponse = await cloudinaryService.generateAndUploadImage(
            character.portrait_prompt || `2D character sprite, ${character.name}, cartoon style`,
            `${investigationId}/characters/${character.name}_portrait`
          );
          portraitUrl = portraitResponse.url;
          
          // Background de dialogue avec retry
          const dialogBgResponse = await cloudinaryService.generateAndUploadImage(
            character.dialog_background_prompt || `2D game background, ${character.location_description}, cartoon style`,
            `${investigationId}/characters/${character.name}_dialog_bg`
          );
          dialogBackgroundUrl = dialogBgResponse.url;
        } catch (error) {
          console.warn(`⚠️ Erreur génération images pour ${character.name}, utilisation fallback`);
          portraitUrl = `https://via.placeholder.com/200x200/4f46e5/ffffff?text=${character.name}`;
          dialogBackgroundUrl = `https://via.placeholder.com/800x600/1a1a1a/ffffff?text=${character.location_description}`;
        }

        const { data: savedCharacter, error: characterError } = await supabase
          .from('characters')
          .insert({
            ...character,
            investigation_id: investigationId,
            image_url: portraitUrl,
            dialog_background_url: dialogBackgroundUrl
          })
          .select()
          .single();

        if (characterError) {
          console.error(`💥 Erreur sauvegarde personnage ${character.name}:`, characterError);
          throw characterError;
        }

        savedCharacters.push(savedCharacter);
      }

      // Sauvegarder les indices
      const savedClues = [];
      for (const clue of investigationData.clues) {
        const { data: savedClue, error: clueError } = await supabase
          .from('clues')
          .insert({
            ...clue,
            investigation_id: investigationId
          })
          .select()
          .single();

        if (clueError) {
          console.error(`💥 Erreur sauvegarde indice ${clue.name}:`, clueError);
          throw clueError;
        }

        savedClues.push(savedClue);
      }

      // Mettre à jour l'URL du background
      const { error: updateError } = await supabase
        .from('investigations')
        .update({ background_url: backgroundUrl })
        .eq('id', investigationId);

      if (updateError) {
        console.warn('⚠️ Erreur mise à jour background URL:', updateError);
      }

      // Créer l'objet Investigation final
      const finalInvestigation: Investigation = {
        id: investigationId,
        title: investigationData.title,
        description: investigationData.description || '',
        context: investigationData.context || '',
        prompt: prompt,
        background_url: backgroundUrl,
        characters: savedCharacters,
        clues: savedClues,
        status: 'en_cours',
        player_role: 'enquêteur',
        created_at: new Date().toISOString(),
        accusation_made: false,
        game_result: 'ongoing'
      };

      console.log('🎉 Investigation complète générée:', finalInvestigation);
      
      toast.success('Enquête générée avec succès !', {
        description: `${savedCharacters.length} personnages et ${savedClues.length} indices créés`
      });

      onInvestigationGenerated(finalInvestigation);

    } catch (error) {
      console.error('💥 Erreur génération:', error);
      toast.error('Erreur lors de la génération', {
        description: 'Veuillez réessayer dans quelques instants'
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-gray-500" />
          Créer une enquête
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Décrivez votre enquête
            </label>
            <Textarea
              id="prompt"
              placeholder="Ex: Un meurtre dans un château lors d'une soirée de gala..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Exemples d'enquêtes
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((quickPrompt, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => handleQuickPrompt(quickPrompt)}
                >
                  {quickPrompt}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer l'enquête
                </>
              )}
            </Button>
          </div>

          {generationStep && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">{generationStep}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Personnages
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Créez des personnages uniques avec des personnalités complexes et des relations interconnectées.
            </CardContent>
          </Card>

          <Card className="bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Indices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Générez des indices cachés et des mystères à résoudre pour guider l'enquête.
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                IA Avancée
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Profitez de l'IA pour créer des scénarios complexes et des rebondissements inattendus.
            </CardContent>
          </Card>

          <Card className="bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-red-500" />
                Enquête Unique
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700">
              Chaque enquête est unique, avec des détails surprenants et des défis stimulants.
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptGenerator;
