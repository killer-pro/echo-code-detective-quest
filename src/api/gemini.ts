
interface GeminiResponse {
  text: string;
  keywords: string[];
  reputationImpact: number;
  truthLikelihood: number;
}

export class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCharacterResponse(
    characterName: string,
    role: string,
    personality: any,
    knowledge: string,
    reputationScore: number,
    userInput: string,
    conversationHistory: string[]
  ): Promise<GeminiResponse> {
    const prompt = this.buildCharacterPrompt(
      characterName,
      role,
      personality,
      knowledge,
      reputationScore,
      userInput,
      conversationHistory
    );

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || "Je préfère ne pas répondre.";

      return this.parseResponse(text, reputationScore);
    } catch (error) {
      console.error('Erreur API Gemini:', error);
      return {
        text: "Je ne peux pas vous répondre pour le moment.",
        keywords: [],
        reputationImpact: -5,
        truthLikelihood: 0.5,
      };
    }
  }

  private buildCharacterPrompt(
    name: string,
    role: string,
    personality: any,
    knowledge: string,
    reputation: number,
    userInput: string,
    history: string[]
  ): string {
    return `Tu es ${name}, un(e) ${role} dans une enquête policière.

PERSONNALITÉ: ${personality.traits.join(', ')}
ÉTAT ÉMOTIONNEL: ${personality.emotional_state}
NIVEAU DE COOPÉRATION: ${personality.cooperation_level}/10

RÉPUTATION avec l'enquêteur: ${reputation}/100
${reputation < 30 ? "Tu es méfiant(e) et peu coopératif/ve." : ""}
${reputation > 70 ? "Tu fais confiance à l'enquêteur." : ""}

CE QUE TU SAIS:
${knowledge}

HISTORIQUE RÉCENT:
${history.slice(-3).join('\n')}

L'enquêteur te dit: "${userInput}"

Réponds de manière naturelle selon ta personnalité et ta relation avec l'enquêteur. Tu peux:
- Être coopératif(ve) ou méfiant(e)
- Donner des informations vraies, partielles ou fausses
- Refuser de répondre si ta réputation est trop basse
- Mentionner des détails que tu as remarqués

Réponds en français, de manière conversationnelle.`;
  }

  private parseResponse(text: string, reputation: number): GeminiResponse {
    // Extraction des mots-clés potentiels (noms propres, lieux, objets)
    const keywords = text.match(/\b[A-Z][a-zA-Z]*\b/g)?.slice(0, 5) || [];
    
    // Impact sur la réputation basé sur le contenu
    let reputationImpact = 0;
    if (text.includes("ne sais pas") || text.includes("refuse")) {
      reputationImpact = -2;
    } else if (text.length > 100) {
      reputationImpact = 1; // Réponse détaillée = coopération
    }

    // Probabilité de vérité basée sur la réputation et le rôle
    const truthLikelihood = Math.min(0.95, Math.max(0.1, reputation / 100 + Math.random() * 0.3));

    return {
      text,
      keywords,
      reputationImpact,
      truthLikelihood,
    };
  }

  async generateInvestigationFromPrompt(prompt: string): Promise<any> {
    const investigationPrompt = `Crée une enquête policière basée sur ce scénario: "${prompt}"

Génère au format JSON:
{
  "title": "Titre de l'enquête",
  "description": "Description détaillée",
  "characters": [
    {
      "name": "Nom du personnage",
      "role": "témoin/suspect/innocent",
      "personality": {
        "traits": ["trait1", "trait2"],
        "emotional_state": "nerveux/calme/en_colère",
        "cooperation_level": 7
      },
      "knowledge": "Ce que ce personnage sait",
      "secrets": "Ce qu'il cache",
      "position": {"x": 200, "y": 300}
    }
  ],
  "locations": [
    {
      "name": "Lieu",
      "description": "Description du lieu",
      "clues": ["indice1", "indice2"]
    }
  ]
}

Assure-toi que l'enquête soit cohérente et engageante.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: investigationPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000,
          },
        }),
      });

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || "{}";
      
      // Extraction du JSON depuis la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Impossible de parser la réponse JSON');
    } catch (error) {
      console.error('Erreur génération enquête:', error);
      return null;
    }
  }
}

// Instance singleton avec clé d'API depuis l'environnement
export const geminiAPI = new GeminiAPI(import.meta.env.VITE_GEMINI_API_KEY || '');
