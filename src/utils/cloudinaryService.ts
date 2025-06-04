
import { supabase } from '../integrations/supabase/client';
import { type Asset, type Investigation, convertSupabaseInvestigation } from '../types';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

class CloudinaryService {
  private cloudName = 'dy2ayuond';
  private uploadPreset = 'investigations_assets';

  async uploadImage(file: File, folder: string = 'investigations'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Erreur lors de l\'upload Cloudinary:', error);
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
      
      // Simuler la génération d'image (remplacer par votre service d'IA)
      const imageUrl = await this.mockImageGeneration(prompt, assetType);
      
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
      background: 'https://via.placeholder.com/800x600/1e293b/ffffff?text=Background',
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
