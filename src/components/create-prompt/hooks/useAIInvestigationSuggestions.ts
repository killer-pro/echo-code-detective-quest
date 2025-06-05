import { useState, useEffect } from 'react';
import { geminiAPI } from '../../../api/gemini'; // Import geminiAPI

interface InvestigationSuggestion {
  category: string;
  title: string;
  prompt: string;
  complexity: string;
  characters: number;
}

export const useAIInvestigationSuggestions = () => {
  const [suggestions, setSuggestions] = useState<InvestigationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace fetch with call to geminiAPI
      const aiSuggestions = await geminiAPI.generateInvestigationSuggestions(`Generate 4 diverse and creative investigation scenarios for a detective game. Each scenario should include:
          - A unique mystery category (like "Classic Mystery", "Modern Crime", "Historical Intrigue", "Supernatural Mystery", etc.)
          - An engaging title
          - A detailed prompt describing the scenario, characters, and mystery (2-3 sentences)
          - Complexity level (Easy, Medium, Hard)
          - Number of characters (3-5)

          Make each scenario unique and interesting. Vary the settings, time periods, and types of mysteries. Include diverse character types and compelling storylines.

          Return the result as a JSON array with this exact structure:
          [
            {
              "category": "Category Name",
              "title": "Investigation Title",
              "prompt": "Detailed scenario description...",
              "complexity": "Easy|Medium|Hard",
              "characters": 3
            }
          ]

          Only return the JSON array, no other text.`);
      
      // geminiAPI.generateInvestigationSuggestions already returns the parsed array or throws an error
      setSuggestions(aiSuggestions);

    } catch (err) {
      console.error('Error generating investigation suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      
      // Fallback to default suggestions
      setSuggestions([
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
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    refreshSuggestions: generateSuggestions
  };
};
