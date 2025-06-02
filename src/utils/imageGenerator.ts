
import { supabase } from '../integrations/supabase/client';

const IMAGE_GENERATION_API_URL = 'https://image.pollinations.ai/prompt/';

export interface GenerateImageParams {
  description: string;
  style?: 'realistic' | 'cartoon' | 'pixel-art' | 'fantasy' | 'noir';
  type?: 'background' | 'character' | 'prop';
}

export async function generateAssetImage(params: GenerateImageParams): Promise<string | null> {
  if (!params.description) {
    console.warn('No description provided for image generation.');
    return generatePlaceholderImage('empty asset');
  }

  try {
    // Construire le prompt spécialisé selon le type d'asset
    let enhancedPrompt = params.description;
    
    if (params.type === 'background') {
      enhancedPrompt = `${params.description}, 2D game background, flat design, side view, ${params.style || 'cartoon'} style, no 3D, simple shapes, game environment`;
    } else if (params.type === 'character') {
      enhancedPrompt = `${params.description}, 2D character sprite, front view, ${params.style || 'cartoon'} style, flat design, simple shapes, game character, portrait style, no 3D, no realistic`;
    } else if (params.type === 'prop') {
      enhancedPrompt = `${params.description}, 2D game object, flat design, ${params.style || 'cartoon'} style, simple shapes, clean background, no 3D`;
    }

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `${IMAGE_GENERATION_API_URL}${encodedPrompt}?width=512&height=512&model=flux&nologo=true&private=false&enhance=false&safe=false&seed=${Math.floor(Math.random() * 1000000)}`;
    
    console.log('Generating image from URL:', imageUrl);
    
    // Vérifier que l'image se charge correctement
    await validateImageUrl(imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return generatePlaceholderImage(params.description);
  }
}

async function validateImageUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

function generatePlaceholderImage(description: string): string {
  const encodedText = encodeURIComponent(description.substring(0, 20));
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#374151"/>
      <text x="256" y="256" fill="#9CA3AF" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle">${description.substring(0, 15)}...</text>
    </svg>
  `)}`;
}

export async function saveGeneratedAssetToDatabase(
  investigationId: string,
  assetName: string,
  assetType: 'background' | 'character' | 'prop',
  imageUrl: string,
  prompt: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('generated_assets')
      .insert({
        investigation_id: investigationId,
        asset_name: assetName,
        asset_type: assetType,
        image_url: imageUrl,
        prompt: prompt
      });

    if (error) throw error;
    console.log(`Asset ${assetName} sauvegardé en base de données`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'asset:', error);
  }
}

export async function loadAssetsFromDatabase(investigationId: string): Promise<Array<{
  asset_name: string;
  asset_type: string;
  image_url: string;
  prompt: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('generated_assets')
      .select('*')
      .eq('investigation_id', investigationId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors du chargement des assets:', error);
    return [];
  }
}

export async function downloadAndCacheImage(url: string, name: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);
    
    console.log(`Image ${name} cached successfully`);
    return localUrl;
  } catch (error) {
    console.error(`Failed to download image ${name}:`, error);
    return url; // Fallback to original URL
  }
}
