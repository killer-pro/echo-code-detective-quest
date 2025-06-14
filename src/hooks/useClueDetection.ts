
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DiscoveredClue, ClueType } from '../types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useClueDetection = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const detectAndSaveClue = async (
    investigationId: string,
    characterId: string,
    dialogId: string,
    characterReply: string,
    truthLikelihood: number
  ): Promise<DiscoveredClue | null> => {
    if (truthLikelihood < 0.7) return null; // Seulement les réponses très crédibles

    setIsProcessing(true);
    try {
      // Analyser la réponse pour détecter des indices
      const clueData = analyzeResponseForClues(characterReply, truthLikelihood);
      
      if (!clueData) return null;

      console.log('🕵️ Indice détecté:', clueData);

      // Sauvegarder l'indice en base en utilisant la table clues existante
      const { data, error } = await supabase
        .from('clues')
        .insert({
          id: uuidv4(),
          investigation_id: investigationId,
          name: `Indice #${Date.now()}`,
          description: clueData.text,
          location: `Dialogue avec ${characterId}`,
        })
        .select()
        .single();

      if (error) {
        console.error('💥 Erreur sauvegarde indice:', error);
        return null;
      }

      toast.success('🔍 Nouvel indice découvert !', {
        description: clueData.text.substring(0, 50) + '...'
      });

      // Retourner un DiscoveredClue compatible
      return {
        id: data.id,
        investigation_id: investigationId,
        character_id: characterId,
        dialog_id: dialogId,
        clue_text: clueData.text,
        importance_level: clueData.importance,
        clue_type: clueData.type,
        discovered_at: new Date().toISOString()
      } as DiscoveredClue;
    } catch (error) {
      console.error('💥 Erreur détection indice:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeResponseForClues = (response: string, truthLikelihood: number): {
    text: string;
    importance: number;
    type: ClueType;
  } | null => {
    const lowerResponse = response.toLowerCase();
    
    // Mots-clés pour différents types d'indices
    const evidenceKeywords = ['preuve', 'objet', 'trouvé', 'caché', 'découvert', 'document', 'photo'];
    const behaviorKeywords = ['nerveux', 'suspect', 'étrange', 'bizarre', 'inquiet', 'fuyant'];
    const contradictionKeywords = ['mais', 'cependant', 'non', 'pas vrai', 'mentir', 'faux'];
    const motiveKeywords = ['raison', 'motif', 'pourquoi', 'jaloux', 'colère', 'vengeance', 'argent'];
    
    let clueType: ClueType = 'testimony';
    let importance = Math.ceil(truthLikelihood * 3); // 1-3 basé sur la crédibilité
    
    // Déterminer le type d'indice
    if (evidenceKeywords.some(keyword => lowerResponse.includes(keyword))) {
      clueType = 'physical_evidence';
      importance = Math.min(importance + 1, 5);
    } else if (behaviorKeywords.some(keyword => lowerResponse.includes(keyword))) {
      clueType = 'behavior';
    } else if (contradictionKeywords.some(keyword => lowerResponse.includes(keyword))) {
      clueType = 'contradiction';
      importance = Math.min(importance + 1, 5);
    } else if (motiveKeywords.some(keyword => lowerResponse.includes(keyword))) {
      clueType = 'motive';
      importance = Math.min(importance + 1, 5);
    }
    
    // Filtrer les réponses trop courtes ou génériques
    if (response.length < 20 || 
        lowerResponse.includes('je ne sais pas') ||
        lowerResponse.includes('aucune idée')) {
      return null;
    }

    return {
      text: response.length > 150 ? response.substring(0, 150) + '...' : response,
      importance,
      type: clueType
    };
  };

  return {
    detectAndSaveClue,
    isProcessing
  };
};
