
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { investigationAgents } from '../utils/investigationAgents';
import { supabase } from '../integrations/supabase/client';
import { Investigation } from '../types';
import { toast } from 'sonner';
import { generateAssetImage } from '../utils/imageGenerator';
import { v4 as uuidv4 } from 'uuid';

interface PromptGeneratorProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onInvestigationGenerated: (investigation: Investigation) => void;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ 
  prompt, 
  setPrompt, 
  onInvestigationGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);

  const updateStep = (step: string) => {
    setGenerationSteps(prev => [...prev, step]);
  };

  const generateInvestigation = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir une description pour votre enquête');
      return;
    }

    setIsGenerating(true);
    setGenerationSteps([]);

    try {
      updateStep('🤖 Génération de l\'enquête par IA...');
      
      // Génération par agents avec retry automatique
      const investigation = await investigationAgents.generateInvestigationWithAgents(prompt);
      
      updateStep('💾 Sauvegarde de l\'enquête...');
      
      // Sauvegarder d'abord l'enquête
      const { data: savedInvestigation, error: invError } = await supabase
        .from('investigations')
        .insert({
          title: investigation.title,
          prompt: prompt,
          status: 'en_cours',
          description: investigation.description,
          context: investigation.context,
          background_prompt: investigation.background_prompt,
          player_role: 'enquêteur'
        })
        .select()
        .single();

      if (invError) {
        console.error('💥 Erreur sauvegarde enquête:', invError);
        throw invError;
      }

      console.log('✅ Enquête sauvegardée:', savedInvestigation.id);
      
      updateStep('👥 Sauvegarde des personnages...');

      // Identifier et sauvegarder le coupable
      const culprit = investigation.characters.find(char => char.is_culprit === true);
      let culpritId = null;

      // Sauvegarder les personnages
      const charactersToSave = investigation.characters.map(char => ({
        investigation_id: savedInvestigation.id,
        name: char.name,
        role: char.role,
        personality: char.personality as any,
        knowledge: char.knowledge,
        position: char.position,
        reputation_score: char.reputation_score,
        sprite: 'character',
        expression_state: 'neutre',
        alerted: false,
        location_description: char.location_description,
        is_culprit: char.is_culprit || false
      }));

      const { data: savedCharacters, error: charError } = await supabase
        .from('characters')
        .insert(charactersToSave)
        .select();

      if (charError) {
        console.error('💥 Erreur sauvegarde personnages:', charError);
        throw charError;
      }

      console.log('✅ Personnages sauvegardés:', savedCharacters.length);

      // Récupérer l'ID du coupable sauvegardé
      if (culprit) {
        const savedCulprit = savedCharacters.find(char => 
          char.name === culprit.name && char.is_culprit === true
        );
        if (savedCulprit) {
          culpritId = savedCulprit.id;
          console.log('🎯 Coupable identifié:', savedCulprit.name, 'ID:', culpritId);
        }
      }

      // Mettre à jour l'enquête avec l'ID du coupable
      if (culpritId) {
        const { error: updateError } = await supabase
          .from('investigations')
          .update({ culprit_character_id: culpritId })
          .eq('id', savedInvestigation.id);

        if (updateError) {
          console.error('💥 Erreur mise à jour coupable:', updateError);
        } else {
          console.log('✅ Coupable mis à jour dans l\'enquête');
        }
      }

      updateStep('🔍 Sauvegarde des indices...');

      // Sauvegarder les indices
      if (investigation.clues && investigation.clues.length > 0) {
        const cluesToSave = investigation.clues.map(clue => ({
          id: uuidv4(),
          investigation_id: savedInvestigation.id,
          name: clue.name,
          description: clue.description,
          location: clue.location
        }));

        const { error: cluesError } = await supabase
          .from('clues')
          .insert(cluesToSave);

        if (cluesError) {
          console.error('💥 Erreur sauvegarde indices:', cluesError);
        } else {
          console.log('✅ Indices sauvegardés');
        }
      }

      updateStep('🎨 Génération des assets visuels...');

      // Générer les assets avec retry
      try {
        // Background principal
        const backgroundUrl = await generateAssetImage({
          description: investigation.background_prompt || '2D game background, mystery scene, cartoon style',
          type: 'background',
          style: 'cartoon'
        });

        // Portraits des personnages
        for (const character of savedCharacters) {
          try {
            const portraitUrl = await generateAssetImage({
              description: `2D character sprite, ${character.name}, ${character.role}, cartoon style`,
              type: 'character',
              style: 'cartoon'
            });

            const dialogBgUrl = await generateAssetImage({
              description: `2D game background, ${character.location_description}, cartoon style`,
              type: 'background',
              style: 'cartoon'
            });

            // Mettre à jour le personnage avec les URLs
            await supabase
              .from('characters')
              .update({
                image_url: portraitUrl,
                dialog_background_url: dialogBgUrl
              })
              .eq('id', character.id);

          } catch (error) {
            console.warn(`⚠️ Erreur génération asset pour ${character.name}:`, error);
          }
        }

        // Mettre à jour l'enquête avec le background
        if (backgroundUrl) {
          await supabase
            .from('investigations')
            .update({ background_url: backgroundUrl })
            .eq('id', savedInvestigation.id);
        }

      } catch (error) {
        console.warn('⚠️ Erreur génération assets:', error);
        toast.warning('Assets générés partiellement. Certaines images peuvent manquer.');
      }

      updateStep('✅ Enquête générée avec succès !');

      // Construire l'objet Investigation complet
      const finalInvestigation: Investigation = {
        ...savedInvestigation,
        characters: savedCharacters.map(char => ({
          ...char,
          investigation_id: savedInvestigation.id,
          position: char.position || { x: 0, y: 0 },
          personality: char.personality || {},
          alerted: false,
          expression_state: (char.expression_state as any) || 'neutre',
          role: char.role as any
        })),
        clues: [],
        culprit_character_id: culpritId
      };

      console.log('🎉 Enquête complète générée:', finalInvestigation.title);
      onInvestigationGenerated(finalInvestigation);

      toast.success('Enquête générée avec succès !', {
        description: `"${investigation.title}" est prête à être explorée.`
      });

    } catch (error) {
      console.error('💥 Erreur génération:', error);
      toast.error('Erreur lors de la génération', {
        description: 'Veuillez réessayer dans un moment.'
      });
      updateStep('❌ Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full bg-slate-800/80 backdrop-blur border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Générateur d'Enquête IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2 text-gray-300">
            Décrivez votre enquête
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez le type d'enquête que vous souhaitez créer..."
            className="min-h-[100px] bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            disabled={isGenerating}
          />
        </div>

        <Button 
          onClick={generateInvestigation} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? 'Génération en cours...' : 'Générer l\'Enquête'}
        </Button>

        {generationSteps.length > 0 && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h4 className="font-medium mb-2 text-white">Progression :</h4>
            <div className="space-y-1">
              {generationSteps.map((step, index) => (
                <div key={index} className="text-sm text-gray-300">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptGenerator;
