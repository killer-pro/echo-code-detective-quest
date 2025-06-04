
import { supabase } from '../integrations/supabase/client';

const IMAGE_GENERATION_API_URL = 'https://image.pollinations.ai/prompt/';

export interface GenerateImageParams {
  description: string;
  style?: 'realistic' | 'cartoon' | 'pixel-art' | 'fantasy' | 'noir';
  type?: 'background' | 'character' | 'prop';
}

// Fonction utilitaire pour valider et obtenir un style compatible avec GenerateImageParams
export function getValidImageStyle(style: string | undefined | null): GenerateImageParams['style'] {
  const validStyles: GenerateImageParams['style'][] = ['realistic', 'cartoon', 'pixel-art', 'fantasy', 'noir'];
  if (style && validStyles.includes(style as GenerateImageParams['style'])) {
    return style as GenerateImageParams['style'];
  }
  return 'cartoon'; // Style par défaut
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
      enhancedPrompt = `${params.description}, detailed scene background, atmospheric lighting, ${params.style || 'cartoon'} style, game environment, high quality, cinematic view`;
    } else if (params.type === 'character') {
      enhancedPrompt = `${params.description}, character portrait, detailed face and clothing, ${params.style || 'cartoon'} style, high quality character art, full body or portrait view`;
    } else if (params.type === 'prop') {
      enhancedPrompt = `${params.description}, detailed object, ${params.style || 'cartoon'} style, game item, clean background, high quality`;
    }

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `${IMAGE_GENERATION_API_URL}${encodedPrompt}?width=512&height=512&model=flux&nologo=true&private=false&enhance=true&safe=false&seed=${Math.floor(Math.random() * 1000000)}`;
    
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

// Fonction pour améliorer les prompts d'images
export function enhanceImagePrompt(basePrompt: string, type: 'character' | 'background' | 'dialogue_bg', characterRole?: string): string {
  let enhancedPrompt = basePrompt;
  
  switch (type) {
    case 'character':
      enhancedPrompt = `High quality character portrait of ${basePrompt}`;
      if (characterRole) {
        enhancedPrompt += `, ${characterRole} appearance`;
      }
      enhancedPrompt += ', detailed facial features, professional character art, clear background, cartoon style, game character design';
      break;
      
    case 'background':
      enhancedPrompt = `Atmospheric scene background: ${basePrompt}, cinematic lighting, detailed environment, game background art, high quality, immersive setting, cartoon style`;
      break;
      
    case 'dialogue_bg':
      enhancedPrompt = `Dialogue background scene: ${basePrompt}, atmospheric, moody lighting, perfect for character conversations, detailed interior/exterior, cartoon style, cinematic composition`;
      break;
  }
  
  return enhancedPrompt;
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
