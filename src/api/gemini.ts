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

interface InvestigationSuggestion {
  category: string;
  title: string;
  prompt: string;
  complexity: string;
  characters: number;
}

const GEMINI_API_KEY = "AIzaSyDTz4uts8cIeNp9D2IxK1Zyk8sfu2X_Ybo";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

class GeminiAPI {
  private async makeRequest(prompt: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Gemini API attempt ${attempt}/${maxRetries}`);
        
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
          if (response.status === 503 && attempt < maxRetries) {
            console.warn(`⚠️ Gemini API temporarily unavailable (503), retrying in ${attempt * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          console.log(`✅ Gemini API successful on attempt ${attempt}`);
          return data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (error) {
        console.error(`💥 Gemini API attempt ${attempt} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries && (error.message.includes('503') || error.message.includes('temporarily'))) {
          console.log(`🔄 Retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
    }
    
    console.error(`💥 All Gemini API attempts failed after ${maxRetries} tries`);
    throw lastError;
  }

  async generateInvestigation(userPrompt: string): Promise<InvestigationData> {
    const prompt = `
Create a procedural investigation based on this user prompt: "${userPrompt}"

You must respond only in valid JSON with this exact structure:
{
  "title": "Investigation Title",
  "description": "Detailed description of the mystery",
  "context": "Initial narrative context explaining the starting situation",
  "assetPrompts": [
    {
      "type": "background",
      "name": "Main Scene",
      "prompt": "Description for a 2D game background, side view, pixel art style",
      "style": "cartoon"
    },
    {
      "type": "character",
      "name": "Main Character",
      "prompt": "2D character sprite, front view, cartoon/pixel art style",
      "style": "cartoon"
    }
  ],
  "characters": [
    {
      "id": "unique_id",
      "name": "Character Name",
      "role": "witness",
      personality: { // Keep Record<string, any> for personality as its structure is flexible
        "traits": ["trait1", "trait2"],
        "secrets": "character's secrets",
        "motivations": "motivations"
      },
      "knowledge": "What the character knows about the investigation",
      "position": {"x": 200, "y": 150},
      "reputation_score": 50
    }
  ]
}

IMPORTANT for assetPrompts (2D GAME):
- Create 1 main background: "2D game background, side view, [description], cartoon/pixel art style, flat design, game environment"
- Create 1 prompt per character: "2D character sprite, front view, [description], cartoon style, game character, flat design, simple shapes"
- Create 2-3 props/objects: "2D game object, [description], simple flat design, cartoon style, game prop"
- Always specify "2D", "flat design", "cartoon style" or "pixel art"
- Avoid "realistic", "3D", "photographic"
- Use styles: "cartoon", "pixel-art", "flat-design"

Create 3-5 characters with varied roles (witness, suspect, innocent).
Positions must be between x:100-700 and y:100-500.
`;

    try {
      const responseText = await this.makeRequest(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Match JSON object
      if (!jsonMatch) {
        throw new Error('Invalid investigation JSON response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating investigation:', error);
      // Fallback investigation
      return {
        title: "Mystery at the Manor",
        description: "A mysterious theft occurred at the manor. Interrogate the witnesses to discover the truth.",
        context: "You are called to investigate a theft in a Victorian manor. The atmosphere is tense and there are many suspects.",
        assetPrompts: [
          {
            type: "background",
            name: "Victorian Manor",
            prompt: "2D game background, Victorian manor interior, side view, cartoon style, flat design, game environment, library with bookshelves",
            style: "cartoon"
          },
          {
            type: "character",
            name: "Butler",
            prompt: "2D character sprite, English butler, front view, cartoon style, flat design, black suit, elderly man, game character",
            style: "cartoon"
          }
        ],
        characters: [
          {
            id: "butler_1",
            name: "James the Butler",
            role: "témoin", // Keep French value for internal logic
            personality: { 
              traits: ["Discrete", "Loyal", "Observant"], 
              secrets: "Knows all the family's secrets",
              motivations: "Protect the family's reputation"
            },
            knowledge: "Saw someone lurking near the safe",
            position: { x: 200, y: 200 },
            reputation_score: 60
          }
        ]
      };
    }
  }

  async generateInvestigationSuggestions(prompt: string): Promise<InvestigationSuggestion[]> {
    try {
      const responseText = await this.makeRequest(prompt);
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        try {
             return JSON.parse(responseText) as InvestigationSuggestion[];
        } catch (parseError) {
             console.error('Error parsing full AI response as JSON:', parseError);
             throw new Error('Invalid response format from AI (no JSON array or object found)');
        }
      }
    } catch (error) {
      console.error('Error generating investigation suggestions:', error);
      return [
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
      ];
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
You are ${characterName}, a ${role} in an investigation.

Personality: ${JSON.stringify(personality)}
Knowledge: ${knowledge}
Current Reputation: ${reputation}/100
History: ${conversationHistory.slice(-3).join('\n')}

The investigator tells you: "${userMessage}"

You must respond in JSON with this structure:
{
  "text": "Your response as the character",
  "keywords": ["keyword1", "keyword2"],
  "reputationImpact": 0,
  "truthLikelihood": 0.5
}

Rules:
- Stay in character
- If reputation < 30, be suspicious
- If reputation > 70, be cooperative
- reputationImpact: -5 to +5 depending on interaction
- truthLikelihood: 0.0 (lie) to 1.0 (truth)
- keywords: 2-4 important keywords from your response
`;

    try {
      const responseText = await this.makeRequest(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid character JSON response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating response:', error);
      if (error.message.includes('503') || error.message.includes('temporarily')) {
        throw new Error('AI service is temporarily unavailable. Please try again in a few moments.');
      }
      return {
        text: "I cannot answer you now...",
        keywords: ["silence", "mystery"],
        reputationImpact: -1,
        truthLikelihood: 0.1
      };
    }
  }
}

export const geminiAPI = new GeminiAPI();
