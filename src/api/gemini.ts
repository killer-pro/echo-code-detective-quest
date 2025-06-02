
interface GeminiResponse {
  text: string;
  keywords: string[];
  reputationImpact: number;
  truthLikelihood: number;
}

interface AssetPrompt {
  type: 'background' | 'character' | 'prop';
  name: string;
  prompt: string;
  style: string;
}

interface InvestigationData {
  title: string;
  description: string;
  context: string;
  assetPrompts: AssetPrompt[];
  characters: Array<{
    id: string;
    name: string;
    role: string;
    personality: Record<string, any>;
    knowledge: string;
    position: { x: number; y: number };
    reputation_score: number;
  }>;
}

const GEMINI_API_KEY = "AIzaSyDTz4uts8cIeNp9D2IxK1Zyk8sfu2X_Ybo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

class GeminiAPI {
  private async makeRequest(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
      throw error;
    }
  }

  async generateInvestigation(userPrompt: string): Promise<InvestigationData> {
    const prompt = `
Crée une enquête procédurale basée sur ce prompt utilisateur: "${userPrompt}"

Tu dois répondre uniquement en JSON valide avec cette structure exacte:
{
  "title": "Titre de l'enquête",
  "description": "Description détaillée du mystère",
  "context": "Contexte narratif initial de l'enquête expliquant la situation de départ",
  "assetPrompts": [
    {
      "type": "background",
      "name": "Scene principale",
      "prompt": "Description pour un décor de jeu 2D, vue de côté, pixel art style",
      "style": "cartoon"
    },
    {
      "type": "character",
      "name": "Personnage principal",
      "prompt": "Sprite de personnage 2D, vue de face, style cartoon/pixel art",
      "style": "cartoon"
    }
  ],
  "characters": [
    {
      "id": "unique_id",
      "name": "Nom du personnage",
      "role": "témoin",
      "personality": {
        "traits": ["trait1", "trait2"],
        "secrets": "secrets du personnage",
        "motivations": "motivations"
      },
      "knowledge": "Ce que le personnage sait sur l'enquête",
      "position": {"x": 200, "y": 150},
      "reputation_score": 50
    }
  ]
}

IMPORTANT pour les assetPrompts (JEU 2D):
- Crée 1 arrière-plan principal : "2D game background, side view, [description], cartoon/pixel art style, flat design, game environment"
- Crée 1 prompt par personnage : "2D character sprite, front view, [description], cartoon style, game character, flat design, simple shapes"
- Crée 2-3 props/objets : "2D game object, [description], simple flat design, cartoon style, game prop"
- Toujours spécifier "2D", "flat design", "cartoon style" ou "pixel art"
- Éviter "realistic", "3D", "photographic"
- Utilise des styles: "cartoon", "pixel-art", "flat-design"

Crée 3-5 personnages avec des rôles variés (témoin, suspect, innocent). 
Les positions doivent être entre x:100-700 et y:100-500.
`;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Réponse JSON invalide');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Erreur lors de la génération d\'enquête:', error);
      // Enquête de fallback
      return {
        title: "Mystère au Manoir",
        description: "Un vol mystérieux s'est produit au manoir. Interrogez les témoins pour découvrir la vérité.",
        context: "Vous êtes appelé pour enquêter sur un vol dans un manoir victorien. L'atmosphère est tendue et les suspects nombreux.",
        assetPrompts: [
          {
            type: "background",
            name: "Manoir victorien",
            prompt: "2D game background, Victorian manor interior, side view, cartoon style, flat design, game environment, library with bookshelves",
            style: "cartoon"
          },
          {
            type: "character",
            name: "Majordome",
            prompt: "2D character sprite, English butler, front view, cartoon style, flat design, black suit, elderly man, game character",
            style: "cartoon"
          }
        ],
        characters: [
          {
            id: "butler_1",
            name: "James le Majordome",
            role: "témoin",
            personality: { 
              traits: ["Discret", "Loyal", "Observateur"], 
              secrets: "Connaît tous les secrets de la famille",
              motivations: "Protéger la réputation de la famille"
            },
            knowledge: "A vu quelqu'un rôder près du coffre-fort",
            position: { x: 200, y: 200 },
            reputation_score: 60
          }
        ]
      };
    }
  }

  async generateCharacterResponse(
    characterName: string,
    role: string,
    personality: Record<string, any>,
    knowledge: string,
    reputation: number,
    userMessage: string,
    conversationHistory: string[]
  ): Promise<GeminiResponse> {
    const prompt = `
Tu incarnes ${characterName}, un ${role} dans une enquête.

Personnalité: ${JSON.stringify(personality)}
Connaissances: ${knowledge}
Réputation actuelle: ${reputation}/100
Historique: ${conversationHistory.slice(-3).join('\n')}

L'enquêteur te dit: "${userMessage}"

Tu dois répondre en JSON avec cette structure:
{
  "text": "Ta réponse en tant que personnage",
  "keywords": ["mot1", "mot2"],
  "reputationImpact": 0,
  "truthLikelihood": 0.5
}

Règles:
- Reste dans le caractère
- Si réputation < 30, sois méfiant
- Si réputation > 70, sois coopératif
- reputationImpact: -5 à +5 selon l'interaction
- truthLikelihood: 0.0 (mensonge) à 1.0 (vérité)
- keywords: 2-4 mots-clés importants de ta réponse
`;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Réponse JSON invalide');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Erreur lors de la génération de réponse:', error);
      return {
        text: "Je ne peux pas vous répondre maintenant...",
        keywords: ["silence", "mystère"],
        reputationImpact: -1,
        truthLikelihood: 0.1
      };
    }
  }
}

export const geminiAPI = new GeminiAPI();
