
import { geminiAPI } from '../api/gemini';
import { Character, Investigation, Clue } from '../types';

interface AgentContext {
  investigation: Partial<Investigation>;
  characters: Character[];
  clues: Clue[];
  dialogHistory: Array<{
    character_id: string;
    user_input: string;
    character_reply: string;
    timestamp: string;
  }>;
}

class InvestigationAgents {
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        console.warn(`🔄 Tentative ${attempt} échouée, retry dans ${baseDelay * attempt}ms`);
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async generateInvestigationWithAgents(prompt: string): Promise<Investigation> {
    console.log('🤖 Démarrage génération par agents...');
    
    // Agent 1: Création de l'histoire de base
    const baseStory = await this.retryWithBackoff(async () => {
      return await geminiAPI.generateInvestigation(`
        Créez une histoire d'enquête basée sur: "${prompt}"
        
        Répondez UNIQUEMENT en JSON:
        {
          "title": "Titre de l'enquête",
          "description": "Description détaillée du mystère",
          "context": "Contexte narratif initial",
          "background_prompt": "2D game background, description de la scène principale, cartoon style, flat design"
        }
      `);
    });

    // Agent 2: Création des personnages avec cohérence
    const characters = await this.retryWithBackoff(async () => {
      return await this.generateCoherentCharacters(baseStory, prompt);
    });

    // Agent 3: Génération des indices cohérents
    const clues = await this.retryWithBackoff(async () => {
      return await this.generateCoherentClues(baseStory, characters);
    });

    // Agent 4: Attribution du coupable
    const updatedCharacters = await this.retryWithBackoff(async () => {
      return await this.assignCulprit(characters, baseStory);
    });

    return {
      ...baseStory,
      characters: updatedCharacters,
      clues,
      status: 'en_cours'
    } as Investigation;
  }

  private async generateCoherentCharacters(baseStory: any, originalPrompt: string): Promise<Character[]> {
    const response = await geminiAPI.generateInvestigation(`
      Basé sur cette histoire: "${baseStory.description}"
      
      Créez 3-5 personnages COHÉRENTS avec des relations entre eux.
      
      Répondez UNIQUEMENT en JSON:
      {
        "characters": [
          {
            "name": "Nom",
            "role": "témoin|suspect|innocent",
            "personality": {
              "traits": ["trait1", "trait2"],
              "secrets": "secrets du personnage",
              "relationships": "relations avec les autres personnages",
              "alibi": "où était-il au moment de l'incident",
              "knowledge_level": "ce qu'il sait vraiment"
            },
            "knowledge": "Connaissances du personnage sur l'enquête",
            "position": {"x": 200, "y": 150},
            "reputation_score": 50,
            "location_description": "Où se trouve ce personnage",
            "portrait_prompt": "2D character sprite, description physique détaillée, cartoon style",
            "dialog_background_prompt": "2D game background, lieu du personnage, cartoon style"
          }
        ]
      }
    `);
    
    return response.characters || [];
  }

  private async generateCoherentClues(baseStory: any, characters: Character[]): Promise<Clue[]> {
    const charactersInfo = characters.map(c => `${c.name}: ${c.personality.secrets || 'Pas de secrets'}`).join('\n');
    
    const response = await geminiAPI.generateInvestigation(`
      Histoire: "${baseStory.description}"
      Personnages: ${charactersInfo}
      
      Créez 2-4 indices COHÉRENTS qui permettront de résoudre l'enquête.
      
      Répondez UNIQUEMENT en JSON:
      {
        "clues": [
          {
            "name": "Nom de l'indice",
            "description": "Description et importance de l'indice",
            "location": "Où trouve-t-on cet indice",
            "related_character": "Personnage lié à cet indice",
            "image_prompt": "2D game object, description de l'objet, cartoon style"
          }
        ]
      }
    `);
    
    return response.clues || [];
  }

  private async assignCulprit(characters: Character[], baseStory: any): Promise<Character[]> {
    const response = await geminiAPI.generateInvestigation(`
      Histoire: "${baseStory.description}"
      Personnages: ${characters.map(c => `${c.name} (${c.role}): ${c.knowledge}`).join('\n')}
      
      Désignez qui est le VRAI coupable et pourquoi. Le coupable doit être logique par rapport à l'histoire.
      
      Répondez UNIQUEMENT en JSON:
      {
        "culprit_name": "Nom du coupable",
        "motive": "Motif du crime",
        "method": "Comment le crime a été commis"
      }
    `);
    
    return characters.map(char => ({
      ...char,
      is_culprit: char.name === response.culprit_name
    }));
  }

  async generateContextualResponse(
    character: Character,
    userMessage: string,
    context: AgentContext
  ): Promise<any> {
    // Construire le contexte global
    const globalContext = this.buildGlobalContext(context, character.id);
    
    const prompt = `
      Tu es ${character.name}, ${character.role} dans une enquête.
      
      CONTEXTE GLOBAL DE L'ENQUÊTE:
      ${globalContext}
      
      TA PERSONNALITÉ:
      ${JSON.stringify(character.personality)}
      
      TES CONNAISSANCES:
      ${character.knowledge}
      
      HISTORIQUE DE TES CONVERSATIONS:
      ${context.dialogHistory
        .filter(d => d.character_id === character.id)
        .slice(-3)
        .map(d => `Enquêteur: ${d.user_input}\nToi: ${d.character_reply}`)
        .join('\n\n')}
      
      L'enquêteur te dit: "${userMessage}"
      
      RÈGLES IMPORTANTES:
      1. Reste cohérent avec ce que les autres personnages ont dit
      2. Si quelqu'un prétend t'avoir vu quelque part, confirme ou contredis selon la vérité
      3. Tes réponses doivent être logiques par rapport au contexte global
      4. Si tu es le coupable, sois subtil mais laisse des indices
      
      Réponds en JSON:
      {
        "text": "Ta réponse en tant que ${character.name}",
        "keywords": ["mot-clé1", "mot-clé2"],
        "reputationImpact": 0,
        "truthLikelihood": 0.5,
        "internal_thoughts": "Tes pensées internes (non visible par l'enquêteur)"
      }
    `;

    return await this.retryWithBackoff(async () => {
      const response = await geminiAPI.generateCharacterResponse(
        character.name,
        character.role,
        character.personality,
        character.knowledge,
        50, // reputation par défaut
        userMessage,
        [] // l'historique est déjà dans le prompt
      );
      
      // Ajouter le prompt complet pour debug
      return {
        ...response,
        _debugPrompt: prompt
      };
    });
  }

  private buildGlobalContext(context: AgentContext, currentCharacterId: string): string {
    let globalContext = `ENQUÊTE: ${context.investigation.title}\n`;
    globalContext += `DESCRIPTION: ${context.investigation.description}\n\n`;
    
    globalContext += "PERSONNAGES DE L'ENQUÊTE:\n";
    context.characters.forEach(char => {
      globalContext += `- ${char.name} (${char.role}): ${char.location_description}\n`;
      if (char.personality.alibi) {
        globalContext += `  Alibi: ${char.personality.alibi}\n`;
      }
    });
    
    globalContext += "\nCONVERSATIONS IMPORTANTES ENTRE PERSONNAGES:\n";
    const relevantDialogs = context.dialogHistory
      .filter(d => d.character_id !== currentCharacterId)
      .slice(-10) // Dernières 10 conversations des autres
      .map(d => {
        const charName = context.characters.find(c => c.id === d.character_id)?.name || 'Inconnu';
        return `${charName} a dit: "${d.character_reply}"`;
      });
    
    globalContext += relevantDialogs.join('\n');
    
    if (context.clues.length > 0) {
      globalContext += "\n\nINDICES DÉCOUVERTS:\n";
      context.clues.forEach(clue => {
        globalContext += `- ${clue.name}: ${clue.description}\n`;
      });
    }
    
    return globalContext;
  }
}

export const investigationAgents = new InvestigationAgents();
