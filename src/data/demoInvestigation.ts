import { Investigation, Character } from '../types';

export const DEMO_INVESTIGATION: Investigation = {
  id: 'demo-investigation-001',
  title: 'Le Mystère du Manoir Blackwood',
  prompt: 'Un meurtre mystérieux dans un manoir isolé. Lord Blackwood a été trouvé mort dans sa bibliothèque, et tous les invités sont suspects.',
  status: 'en_cours',
  created_at: new Date().toISOString(),
  created_by: 'demo-user',
  characters: [
    {
      id: 'char-001',
      investigation_id: 'demo-investigation-001',
      name: 'Lady Victoria Blackwood',
      role: 'suspect',
      personality: {
        traits: ['aristocrate', 'calculatrice', 'secrète'],
        motivations: ['héritage', 'réputation familiale'],
        secrets: ['liaison secrète avec le majordome', 'dettes de jeu importantes']
      },
      knowledge: 'Épouse du défunt, connaît tous les secrets de famille. Sait que son mari avait découvert ses dettes.',
      expression_state: 'méfiant',
      reputation_score: 30,
      alerted: false,
      position: { x: 150, y: 200 },
      sprite: 'character',
      created_at: new Date().toISOString()
    },
    {
      id: 'char-002', 
      investigation_id: 'demo-investigation-001',
      name: 'Dr. Edmund Pierce',
      role: 'témoin',
      personality: {
        traits: ['analytique', 'nerveux', 'observateur'],
        motivations: ['vérité scientifique', 'protéger sa réputation'],
        secrets: ['prescrivait des médicaments non autorisés à Lord Blackwood']
      },
      knowledge: 'Médecin de famille, était présent le soir du meurtre. A vu Lady Victoria sortir de la bibliothèque vers 22h.',
      expression_state: 'nerveux',
      reputation_score: 70,
      alerted: true,
      position: { x: 400, y: 150 },
      sprite: 'character',
      created_at: new Date().toISOString()
    },
    {
      id: 'char-003',
      investigation_id: 'demo-investigation-001', 
      name: 'James Fletcher',
      role: 'suspect',
      personality: {
        traits: ['loyal', 'discret', 'traditionnel'],
        motivations: ['protéger les secrets de famille', 'garder son emploi'],
        secrets: ['relation avec Lady Victoria', 'connaît l\'existence du testament secret']
      },
      knowledge: 'Majordome depuis 20 ans, connaît tous les secrets du manoir. A trouvé le corps.',
      expression_state: 'coopératif',
      reputation_score: 85,
      alerted: false,
      position: { x: 600, y: 300 },
      sprite: 'character', 
      created_at: new Date().toISOString()
    },
    {
      id: 'char-004',
      investigation_id: 'demo-investigation-001',
      name: 'Sarah Mills',
      role: 'témoin',
      personality: {
        traits: ['curieuse', 'bavarde', 'observatrice'],
        motivations: ['sécurité de son emploi', 'éviter les ennuis'],
        secrets: ['a entendu une dispute violente avant le meurtre']
      },
      knowledge: 'Femme de chambre, travaille au manoir depuis 5 ans. A entendu des bruits étranges cette nuit-là.',
      expression_state: 'neutre',
      reputation_score: 60,
      alerted: false,
      position: { x: 300, y: 400 },
      sprite: 'character',
      created_at: new Date().toISOString()
    }
  ],
  assetPrompts: [
    {
      type: 'background',
      name: 'manoir_blackwood_background',
      prompt: 'Bibliothèque victorienne luxueuse et sombre, avec de grandes étagères de livres, un bureau en acajou, une cheminée, style gothique, éclairage tamisé',
      style: 'noir'
    },
    {
      type: 'character', 
      name: 'character_lady_victoria',
      prompt: 'Dame aristocrate victorienne, robe noire élégante, bijoux, expression froide et calculatrice, cheveux bruns relevés',
      style: 'realistic'
    },
    {
      type: 'character',
      name: 'character_dr_pierce', 
      prompt: 'Médecin victorien, costume sombre, stéthoscope, lunettes, barbe grise, expression inquiète et nerveuse',
      style: 'realistic'
    },
    {
      type: 'character',
      name: 'character_james_fletcher',
      prompt: 'Majordome victorien, uniforme noir impeccable, gants blancs, posture droite et digne, cheveux gris',
      style: 'realistic'
    },
    {
      type: 'character',
      name: 'character_sarah_mills',
      prompt: 'Femme de chambre victorienne, robe simple, tablier blanc, cheveux attachés, expression timide mais attentive',
      style: 'realistic'
    },
    {
      type: 'prop',
      name: 'prop_murder_weapon',
      prompt: 'Couteau de bureau victorien taché de sang, manche en ivoire gravé, lame ancienne',
      style: 'realistic'
    }
  ]
};

export const DEMO_INITIAL_DIALOGS = [
  {
    id: 'dialog-001',
    investigation_id: 'demo-investigation-001',
    character_id: 'char-003',
    user_input: 'Pouvez-vous me raconter comment vous avez découvert le corps ?',
    character_reply: 'J\'apportais le thé du soir à Monsieur vers 23h comme tous les soirs. J\'ai frappé, mais pas de réponse. Je suis entré et... *visage pâle* ...il était effondré sur son bureau, dans une mare de sang. J\'ai immédiatement appelé la police.',
    timestamp: new Date().toISOString(),
    clickable_keywords: ['thé du soir', 'bureau', 'police'],
    reputation_impact: 5,
    truth_likelihood: 0.9,
    created_at: new Date().toISOString()
  },
  {
    id: 'dialog-002', 
    investigation_id: 'demo-investigation-001',
    character_id: 'char-001',
    user_input: 'Où étiez-vous au moment du meurtre ?',
    character_reply: 'J\'étais dans mes appartements, en train de lire. *évite le regard* Je ne sais rien de ce qui s\'est passé dans la bibliothèque.',
    timestamp: new Date().toISOString(),
    clickable_keywords: ['appartements', 'lire', 'bibliothèque'],
    reputation_impact: -3,
    truth_likelihood: 0.3,
    created_at: new Date().toISOString()
  }
];
