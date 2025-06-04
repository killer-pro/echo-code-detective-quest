
import { supabase } from '../integrations/supabase/client';
import { type Asset, type Investigation, convertSupabaseInvestigation } from '../types';
import { uploadToCloudinary } from './cloudinaryUpload';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export class CloudinaryService {
  async uploadImage(file: File, folder: string = 'investigations'): Promise<string> {
    try {
      return await uploadToCloudinary(file, folder);
    } catch (error) {
      console.error('Erreur lors de l\'upload Cloudinary:', error);
      throw error;
    }
  }

  async uploadImageFromUrl(imageUrl: string, fileName: string): Promise<string> {
    try {
      console.log(`📤 CloudinaryService: Upload depuis URL: ${fileName}`);
      
      // Convertir l'URL d'image en Blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement de l'image: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      
      // Utiliser cloudinaryUpload pour l'upload
      const uploadedUrl = await uploadToCloudinary(file, 'investigations');
      console.log(`✅ CloudinaryService: Image uploadée: ${uploadedUrl}`);
      return uploadedUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload Cloudinary depuis URL:', error);
      throw error;
    }
  }

  async generateAndUploadAsset(
    prompt: string,
    assetName: string,
    investigationId: string,
    assetType: 'background' | 'character' | 'prop' = 'character',
    characterId?: string
  ): Promise<string> {
    try {
      console.log(`🎨 Génération de l'asset: ${assetName}`);
      
      // Améliorer les prompts selon le type d'asset
      let enhancedPrompt = prompt;
      if (assetType === 'background') {
        enhancedPrompt = `Vue de haut, perspective aérienne, plateau de jeu 2D, ${prompt}, style cartoon, couleurs vives, adapté pour un jeu d'enquête vue du dessus`;
      } else if (assetType === 'character') {
        enhancedPrompt = `Portrait de personnage 2D, vue de face, ${prompt}, style cartoon, adapté pour un jeu d'enquête`;
      }
      
      // Simuler la génération d'image (remplacer par votre service d'IA)
      const imageUrl = await this.mockImageGeneration(enhancedPrompt, assetType);
      
      console.log(`✅ Asset généré: ${assetName} -> ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error(`💥 Erreur génération asset ${assetName}:`, error);
      throw error;
    }
  }

  private async mockImageGeneration(prompt: string, assetType: string): Promise<string> {
    // Placeholder - remplacer par votre service de génération d'images IA
    const placeholders = {
      background: 'https://via.placeholder.com/1200x800/1e293b/ffffff?text=Background+Vue+Haut',
      character: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Character',
      prop: 'https://via.placeholder.com/200x200/10b981/ffffff?text=Prop'
    };
    
    return placeholders[assetType as keyof typeof placeholders] || placeholders.character;
  }

  async generateInvestigationAssets(investigation: Investigation): Promise<Investigation> {
    try {
      console.log('🎨 Génération des assets pour:', investigation.title);
      
      // Générer l'arrière-plan si nécessaire
      if (!investigation.background_url && investigation.background_prompt) {
        const backgroundUrl = await this.generateAndUploadAsset(
          investigation.background_prompt,
          'background',
          investigation.id,
          'background'
        );
        
        // Mettre à jour l'investigation avec l'URL de l'arrière-plan
        const { error } = await supabase
          .from('investigations')
          .update({ background_url: backgroundUrl })
          .eq('id', investigation.id);
          
        if (error) {
          console.error('Erreur mise à jour background:', error);
        } else {
          investigation.background_url = backgroundUrl;
        }
      }

      // Générer les images des personnages
      for (const character of investigation.characters) {
        if (!character.image_url && character.portrait_prompt) {
          const characterImageUrl = await this.generateAndUploadAsset(
            character.portrait_prompt,
            character.name,
            investigation.id,
            'character',
            character.id
          );
          
          // Mettre à jour le personnage avec l'URL de l'image
          const { error } = await supabase
            .from('characters')
            .update({ image_url: characterImageUrl })
            .eq('id', character.id);
            
          if (error) {
            console.error(`Erreur mise à jour image ${character.name}:`, error);
          } else {
            character.image_url = characterImageUrl;
          }
        }

        // Générer l'arrière-plan de dialogue si nécessaire
        if (!character.dialogue_background_url && character.dialog_background_prompt) {
          const dialogBgUrl = await this.generateAndUploadAsset(
            character.dialog_background_prompt,
            `${character.name}_dialog_bg`,
            investigation.id,
            'background',
            character.id
          );
          
          const { error } = await supabase
            .from('characters')
            .update({ dialogue_background_url: dialogBgUrl })
            .eq('id', character.id);
            
          if (error) {
            console.error(`Erreur mise à jour dialog bg ${character.name}:`, error);
          } else {
            character.dialogue_background_url = dialogBgUrl;
          }
        }
      }

      console.log('✅ Assets générés avec succès');
      return investigation;
    } catch (error) {
      console.error('💥 Erreur génération assets:', error);
      throw error;
    }
  }

  async deleteAsset(publicId: string): Promise<void> {
    try {
      // Note: Pour supprimer des assets, vous devrez utiliser l'API Admin de Cloudinary
      // qui nécessite votre API secret côté serveur
      console.log(`🗑️ Suppression asset: ${publicId}`);
    } catch (error) {
      console.error('Erreur suppression asset:', error);
      throw error;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
