interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export class CloudinaryUploadService {
  private static CLOUD_NAME = 'dyvgd3xak';
  
  static async uploadImageFromUrl(imageUrl: string, publicId: string): Promise<CloudinaryUploadResponse> {
    try {
      console.log('🌤️ CloudinaryUpload: Upload vers Cloudinary...');
      
      // Télécharger l'image depuis l'URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBlob = await imageResponse.blob();
      
      // Préparer le FormData pour Cloudinary
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');
      formData.append('public_id', publicId);
      formData.append('upload_preset', 'metalx_unsigned'); // Utilisation du preset unsigned fourni
      
      // Upload vers Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResult.secure_url) throw new Error('Cloudinary upload failed');
      return {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height
      };
      
    } catch (error) {
      console.error('💥 CloudinaryUpload: Erreur upload:', error);
      // Fallback: retourner l'URL originale
      return {
        public_id: publicId,
        secure_url: imageUrl,
        width: 512,
        height: 512
      };
    }
  }
}
