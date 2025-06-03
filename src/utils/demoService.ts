
import { DEMO_INVESTIGATION, DEMO_INITIAL_DIALOGS } from '../data/demoInvestigation';

export class DemoService {
  static async getDemoInvestigationData() {
    console.log('🎮 DemoService: Fourniture des données de l\'enquête de démo...');
    return DEMO_INVESTIGATION;
  }
  
  static getDemoDialogs() {
    console.log('💬 DemoService: Fourniture des dialogues de démo...');
    return DEMO_INITIAL_DIALOGS;
  }
  
  static getPlayerStartPosition() {
    return { x: 400, y: 500 };
  }
}
