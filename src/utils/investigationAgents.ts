import { geminiAPI } from '../api/gemini';
import { Character, Investigation, Clue, CharacterRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

interface InvestigationData {
  title: string;
  description: string;
  context: string;
  background_prompt: string;
  characters: Array<{
    name: string;
    role: string;
    personality: any;
    knowledge: string;
    position: { x: number; y: number };
    reputation_score: number;
    location_description: string;
    portrait_prompt: string;
    dialog_background_prompt: string;
    is_culprit?: boolean;
  }>;
  clues: Array<{
    name: string;
    description: string;
    location: string;
    image_prompt: string;
  }>;
}

interface CulpritResponse {
  culprit_name: string;
  motive: string;
  method: string;
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
    
    // Agent 1: Création de l'histoire de base avec minimum 5 personnages
    const baseStory = await this.retryWithBackoff(async () => {
      const response = await geminiAPI.generateInvestigation(`
        Créez une histoire d'enquête basée sur: "${prompt}"
        
        RÈGLES STRICTES:
        - Créez EXACTEMENT 5-6 personnages (minimum 5)
        - Au moins 3 doivent être des suspects potentiels
        - Les personnages innocents peuvent aussi être des suspects
        - Tous les personnages doivent avoir des relations entre eux
        - Aucun personnage externe ne doit être mentionné
        
        Répondez UNIQUEMENT en JSON:
        {
          "title": "Titre de l'enquête",
          "description": "Description détaillée du mystère",
          "context": "Contexte narratif initial",
          "background_prompt": "2D game background, description de la scène principale, cartoon style, flat design"
        }
      `);
      
      return {
        title: response.title || 'Enquête mystérieuse',
        description: response.description || 'Une enquête à résoudre',
        context: response.context || 'Contexte de l\'enquête',
        background_prompt: response.assetPrompts?.[0]?.prompt || '2D game background, mysterious scene, cartoon style'
      };
    });

    // Agent 2: Création des personnages avec cohérence stricte
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
      clues: clues,
      status: 'en_cours'
    } as Investigation;
  }

  private async generateCoherentCharacters(baseStory: any, originalPrompt: string): Promise<Character[]> {
    const response = await geminiAPI.generateInvestigation(`
      Basé sur cette histoire: "${baseStory.description}"
      
      Créez EXACTEMENT 5-6 personnages COHÉRENTS avec des relations entre eux.
      RÈGLES STRICTES:
      - AUCUN personnage externe ne doit être mentionné dans leurs connaissances
      - Tous les personnages doivent se connaître entre eux
      - Au moins 3 doivent être marqués comme "suspect"
      - Les alibis doivent être vérifiables entre eux
      
      Répondez UNIQUEMENT en JSON:
      {
        "characters": [
          {
            "name": "Nom",
            "role": "témoin|suspect|innocent",
            "personality": {
              "traits": ["trait1", "trait2"],
              "secrets": "secrets du personnage",
              "relationships": "relations UNIQUEMENT avec les autres personnages de cette liste",
              "alibi": "où était-il au moment de l'incident (vérifiable par les autres)",
              "knowledge_level": "ce qu'il sait vraiment"
            },
            "knowledge": "Connaissances UNIQUEMENT sur les autres personnages de cette enquête",
            "position": {"x": 200, "y": 150},
            "reputation_score": 50,
            "location_description": "Où se trouve ce personnage",
            "portrait_prompt": "2D character sprite, description physique détaillée, cartoon style",
            "dialog_background_prompt": "2D game background, lieu du personnage, cartoon style"
          }
        ]
      }
    `);
    
    const charactersData = response.characters || [];
    return charactersData.map((char: any, index: number) => ({
      id: uuidv4(),
      investigation_id: '',
      name: char.name,
      role: this.validateRole(char.role),
      personality: char.personality || {},
      knowledge: char.knowledge || '',
      reputation_score: char.reputation_score || 50,
      position: char.position || { x: Math.random() * 600 + 100, y: Math.random() * 400 + 100 },
      sprite: 'character',
      expression_state: 'neutre' as const,
      alerted: false,
      is_culprit: false,
      portrait_prompt: char.portrait_prompt || `2D character sprite, ${char.name}, cartoon style`,
      dialog_background_prompt: char.dialog_background_prompt || `2D game background, ${char.location_description}, cartoon style`,
      location_description: char.location_description || `Location of ${char.name}`,
    }));
  }

  private validateRole(role: string): CharacterRole {
    const validRoles: CharacterRole[] = ['témoin', 'suspect', 'enquêteur', 'innocent'];
    return validRoles.includes(role as CharacterRole) ? role as CharacterRole : 'témoin';
  }

  private async generateCoherentClues(baseStory: any, characters: Character[]): Promise<Clue[]> {
    const charactersInfo = characters.map(c => `${c.name}: ${c.personality.secrets || 'Pas de secrets'}`).join('\n');
    
    const response = await geminiAPI.generateInvestigation(`
      Histoire: "${baseStory.description}"
      Personnages: ${charactersInfo}
      
      Créez 3-4 indices COHÉRENTS qui permettront de résoudre l'enquête.
      Les indices doivent être liés aux personnages existants UNIQUEMENT.
      
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
    
    const cluesData = response.assetPrompts?.filter(asset => asset.type === 'prop') || response.clues || [];
    return cluesData.map((clue: any) => ({
      id: uuidv4(),
      investigation_id: '',
      name: clue.name,
      description: clue.description || '',
      location: clue.location || '',
      image_prompt: clue.image_prompt || `2D game object, ${clue.name}, cartoon style`,
    }));
  }

  private async assignCulprit(characters: Character[], baseStory: any): Promise<Character[]> {
    const response = await geminiAPI.generateInvestigation(`
      Histoire: "${baseStory.description}"
      Personnages: ${characters.map(c => `${c.name} (${c.role}): ${c.knowledge}`).join('\n')}
      
      Désignez qui est le VRAI coupable parmi ces personnages UNIQUEMENT.
      Le coupable doit être logique par rapport à l'histoire.
      
      Répondez UNIQUEMENT en JSON:
      {
        "culprit_name": "Nom du coupable",
        "motive": "Motif du crime",
        "method": "Comment le crime a été commis"
      }
    `) as unknown as CulpritResponse;
    
    console.log('🎯 Coupable désigné par l\'IA:', response.culprit_name);
    
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
    // Construire le contexte global strict
    const globalContext = this.buildStrictGlobalContext(context, character.id);
    
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
      
      RÈGLES ABSOLUES:
      1. Ne parle QUE des personnages présents dans cette enquête
      2. Ne mentionne JAMAIS de personnes externes
      3. Reste cohérent avec ce que les autres personnages ont dit
      4. Si quelqu'un prétend t'avoir vu quelque part, confirme ou contredis selon la vérité
      5. Tes réponses doivent être logiques par rapport au contexte global
      6. Si tu es le coupable, sois subtil mais laisse des indices
      
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
        50,
        userMessage,
        []
      );
      
      return {
        ...response,
        _debugPrompt: prompt
      };
    });
  }

  private buildStrictGlobalContext(context: AgentContext, currentCharacterId: string): string {
    let globalContext = `ENQUÊTE: ${context.investigation.title}\n`;
    globalContext += `DESCRIPTION: ${context.investigation.description}\n\n`;
    
    globalContext += "PERSONNAGES DE L'ENQUÊTE (AUCUN AUTRE N'EXISTE):\n";
    context.characters.forEach(char => {
      globalContext += `- ${char.name} (${char.role}): ${char.location_description}\n`;
      if (char.personality.alibi) {
        globalContext += `  Alibi: ${char.personality.alibi}\n`;
      }
    });
    
    globalContext += "\nCONVERSATIONS IMPORTANTES ENTRE PERSONNAGES:\n";
    const relevantDialogs = context.dialogHistory
      .filter(d => d.character_id !== currentCharacterId)
      .slice(-10)
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
    
    globalContext += "\n\nIMPORTANT: Ne mentionne QUE les personnages listés ci-dessus. Aucune personne externe n'existe dans cette enquête.";
    
    return globalContext;
  }
}

export const investigationAgents = new InvestigationAgents();
