
import { CloudinaryUploadService } from './cloudinaryUpload';

export const uploadToCloudinary = async (file: File, folder: string = 'investigations'): Promise<string> => {
  try {
    console.log('🌤️ CloudinaryService: Upload vers Cloudinary...');
    
    // Convertir le fichier en URL pour CloudinaryUploadService
    const fileUrl = URL.createObjectURL(file);
    const publicId = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await CloudinaryUploadService.uploadImageFromUrl(fileUrl, publicId);
    
    // Nettoyer l'URL temporaire
    URL.revokeObjectURL(fileUrl);
    
    console.log('✅ CloudinaryService: Upload réussi:', result.secure_url);
    return result.secure_url;
    
  } catch (error) {
    console.error('💥 CloudinaryService: Erreur upload:', error);
    throw new Error(`Erreur upload Cloudinary: ${error.message}`);
  }
};

export const cloudinaryService = {
  uploadToCloudinary
};
