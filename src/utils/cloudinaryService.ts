import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';

// Configuration Cloudinary for URL generation (Client-side)
// THIS FILE SHOULD ONLY CONTAIN CLIENT-SIDE LOGIC (URL GENERATION).
// Upload and delete operations MUST be done server-side for security (using the Node.js SDK in a server file).
const cld = new Cloudinary({
  cloud: {
    cloudName: 'dqbmkp8mf' // Utilisez votre nom de cloud
  }
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

// The following methods (uploadImage, deleteImage) should ONLY be called from server-side code (e.g., API routes).
// Exposing API_SECRET in client-side code is a security vulnerability.
// Keep these here as placeholders or remove if you have a dedicated server file.
export class CloudinaryService {
  static async uploadImage(
    imageUrl: string, 
    publicId: string,
    folder: string = 'echocode'
  ): Promise<CloudinaryUploadResult | null> {
    console.error('❌ SECURITY WARNING: uploadImage called from potential client-side code! This should be on the server.');
    // Example: call your server-side upload endpoint
    // const response = await fetch('/api/upload-to-cloudinary', { method: 'POST', body: JSON.stringify({ imageUrl, publicId, folder }) });
    // if (response.ok) return response.json();
    return null; // Prevent execution in client
  }

  static getOptimizedUrl(publicId: string, width: number = 512, height: number = 512): string {
    // Utilisez @cloudinary/url-gen pour construire l'URL
    const myImage = cld.image(publicId);

    // Appliquer la transformation de redimensionnement avec fill
    myImage.resize(fill(width, height));

    // Retourne l'URL générée
    return myImage.toURL();
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    console.error('❌ SECURITY WARNING: deleteImage called from potential client-side code! This should be on the server.');
     // Example: call your server-side delete endpoint
    // const response = await fetch('/api/delete-from-cloudinary', { method: 'POST', body: JSON.stringify({ publicId }) });
    // return response.ok;
    return false; // Prevent execution in client
  }
}
