
import { supabase } from '../integrations/supabase/client';

const CLOUDINARY_CLOUD_NAME = 'dqbmkp8mf';
const CLOUDINARY_API_KEY = '129758995152166';
const CLOUDINARY_API_SECRET = 'aaMSV7CvlWEBtuwd5BX3Yn7UKzE';

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

interface AssetGenerationRequest {
  type: 'background' | 'character' | 'dialogue_bg' | 'player' | 'prop';
  prompt: string;
  investigationId: string;
  characterId?: string;
  locationContext?: string;
  assetName: string;
}

export class CloudinaryService {
  private static async generateImageWithAI(prompt: string): Promise<Blob> {
    // Utiliser l'API Pollinations pour générer l'image
    const enhancedPrompt = `${prompt}, high quality, detailed, game art style, professional illustration`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=flux&nologo=true&private=false&enhance=true`;
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }
    
    return await response.blob();
  }

  private static async uploadToCloudinary(imageBlob: Blob, publicId: string): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('public_id', publicId);
    formData.append('upload_preset', 'unsigned_preset'); // Vous devrez créer ceci dans Cloudinary
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  static async generateAndUploadAsset(request: AssetGenerationRequest): Promise<string> {
    try {
      console.log(`🎨 Génération de l'asset: ${request.assetName}`);
      
      // Générer l'image avec IA
      const imageBlob = await this.generateImageWithAI(request.prompt);
      
      // Créer un ID unique pour Cloudinary
      const timestamp = Date.now();
      const publicId = `${request.investigationId}/${request.type}/${request.assetName}_${timestamp}`;
      
      // Upload vers Cloudinary
      const uploadResult = await this.uploadToCloudinary(imageBlob, publicId);
      
      // Sauvegarder dans Supabase
      const { error } = await supabase
        .from('cloudinary_assets')
        .insert({
          investigation_id: request.investigationId,
          asset_name: request.assetName,
          asset_type: request.type,
          cloudinary_url: uploadResult.secure_url,
          cloudinary_public_id: uploadResult.public_id,
          character_id: request.characterId,
          location_context: request.locationContext
        });

      if (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        throw error;
      }

      console.log(`✅ Asset généré et sauvegardé: ${request.assetName}`);
      return uploadResult.secure_url;
    } catch (error) {
      console.error(`💥 Erreur génération asset ${request.assetName}:`, error);
      throw error;
    }
  }

  static async generateInvestigationAssets(investigationId: string, investigation: any): Promise<void> {
    const promises: Promise<string>[] = [];

    // 1. Générer l'arrière-plan principal
    promises.push(
      this.generateAndUploadAsset({
        type: 'background',
        prompt: `${investigation.title} investigation scene, detailed interior or exterior location, mystery atmosphere, game background style`,
        investigationId,
        assetName: 'main_background'
      })
    );

    // 2. Générer l'image du joueur selon son rôle
    promises.push(
      this.generateAndUploadAsset({
        type: 'player',
        prompt: `${investigation.player_role || 'enquêteur'} character, professional appearance, detective style, front view portrait`,
        investigationId,
        assetName: 'player_character'
      })
    );

    // 3. Générer les images des personnages et leurs arrière-plans de dialogue
    for (const character of investigation.characters) {
      // Image du personnage
      promises.push(
        this.generateAndUploadAsset({
          type: 'character',
          prompt: `${character.name} character, ${character.role}, ${character.personality?.appearance || 'professional appearance'}, game character sprite`,
          investigationId,
          characterId: character.id,
          assetName: `character_${character.name.toLowerCase().replace(/\s+/g, '_')}`
        })
      );

      // Arrière-plan de dialogue (lieu où se trouve le personnage)
      const locationDesc = character.location_description || `${character.name}'s location`;
      promises.push(
        this.generateAndUploadAsset({
          type: 'dialogue_bg',
          prompt: `${locationDesc}, detailed interior background, dialogue scene, mystery atmosphere`,
          investigationId,
          characterId: character.id,
          locationContext: locationDesc,
          assetName: `dialogue_bg_${character.name.toLowerCase().replace(/\s+/g, '_')}`
        })
      );
    }

    // Attendre la génération de tous les assets
    await Promise.all(promises);
    console.log(`✅ Tous les assets générés pour l'investigation: ${investigation.title}`);
  }

  static async getInvestigationAssets(investigationId: string) {
    const { data, error } = await supabase
      .from('cloudinary_assets')
      .select('*')
      .eq('investigation_id', investigationId);

    if (error) {
      console.error('Erreur récupération assets:', error);
      return [];
    }

    return data || [];
  }
}
