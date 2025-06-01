
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PromptGenerator from '../components/PromptGenerator';
import { geminiAPI } from '../api/gemini';
import { Investigation, Character } from '../types';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreatePrompt: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInvestigation = async (prompt: string) => {
    setIsLoading(true);
    
    try {
      console.log('Génération de l\'enquête avec le prompt:', prompt);
      
      // Appel à l'API Gemini pour générer l'enquête
      const generatedData = await geminiAPI.generateInvestigationFromPrompt(prompt);
      
      if (!generatedData) {
        throw new Error('Impossible de générer l\'enquête');
      }

      console.log('Données générées:', generatedData);

      // Transformation des données en format attendu
      const characters: Character[] = generatedData.characters?.map((char: any, index: number) => ({
        id: `char_${Date.now()}_${index}`,
        investigation_id: 'temp_investigation_id',
        name: char.name || `Personnage ${index + 1}`,
        role: char.role || 'témoin',
        personality: {
          traits: char.personality?.traits || ['mystérieux'],
          emotional_state: char.personality?.emotional_state || 'neutre',
          cooperation_level: char.personality?.cooperation_level || 5,
        },
        knowledge: char.knowledge || 'Ce personnage garde ses secrets.',
        expression_state: 'neutre' as const,
        reputation_score: 50,
        alerted: false,
        last_interactions: [],
        position: char.position || { x: 200 + index * 150, y: 300 + (index % 2) * 100 },
        sprite: 'character',
      })) || [];

      // Création de l'investigation
      const investigation: Investigation = {
        id: `investigation_${Date.now()}`,
        title: generatedData.title || 'Enquête générée',
        prompt: prompt,
        created_by: 'user',
        map_id: 'default_map',
        created_at: new Date().toISOString(),
        characters: characters,
        leads: [],
        status: 'en_cours',
      };

      // Met à jour les IDs des personnages avec l'ID de l'investigation
      investigation.characters = investigation.characters.map(char => ({
        ...char,
        investigation_id: investigation.id,
      }));

      console.log('Investigation créée:', investigation);

      // Met à jour l'état global
      dispatch({ type: 'SET_INVESTIGATION', payload: investigation });

      // Redirection vers la page de jeu
      navigate('/game');

    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      
      // Investigation de fallback en cas d'erreur
      const fallbackInvestigation: Investigation = {
        id: `investigation_${Date.now()}`,
        title: 'Enquête de démonstration',
        prompt: prompt,
        created_by: 'user',
        map_id: 'default_map',
        created_at: new Date().toISOString(),
        characters: [
          {
            id: 'char_1',
            investigation_id: `investigation_${Date.now()}`,
            name: 'Marie Dubois',
            role: 'témoin',
            personality: {
              traits: ['nerveuse', 'observatrice'],
              emotional_state: 'inquiet',
              cooperation_level: 6,
            },
            knowledge: 'J\'ai vu quelque chose d\'étrange ce soir-là...',
            expression_state: 'nerveux',
            reputation_score: 50,
            alerted: false,
            last_interactions: [],
            position: { x: 200, y: 300 },
            sprite: 'character',
          },
          {
            id: 'char_2',
            investigation_id: `investigation_${Date.now()}`,
            name: 'Pierre Martin',
            role: 'suspect',
            personality: {
              traits: ['méfiant', 'secret'],
              emotional_state: 'défensif',
              cooperation_level: 3,
            },
            knowledge: 'Je n\'ai rien fait de mal...',
            expression_state: 'méfiant',
            reputation_score: 50,
            alerted: false,
            last_interactions: [],
            position: { x: 400, y: 350 },
            sprite: 'character',
          },
        ],
        leads: [],
        status: 'en_cours',
      };

      dispatch({ type: 'SET_INVESTIGATION', payload: fallbackInvestigation });
      navigate('/game');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-xl font-bold text-white">Créer une nouvelle enquête</h1>
            <p className="text-gray-400 text-sm">Générez une enquête personnalisée avec l'IA</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        <PromptGenerator
          onGenerateInvestigation={handleGenerateInvestigation}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreatePrompt;
