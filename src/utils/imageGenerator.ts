
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
      enhancedPrompt = `${params.description}, game environment, detailed background, ${params.style || 'realistic'} style`;
    } else if (params.type === 'character') {
      enhancedPrompt = `${params.description}, character sprite, full body, ${params.style || 'realistic'} style, game character design`;
    } else if (params.type === 'prop') {
      enhancedPrompt = `${params.description}, game object, item, ${params.style || 'realistic'} style, clean background`;
    }

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `${IMAGE_GENERATION_API_URL}${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&private=false&enhance=false&safe=false`;
    
    console.log('Generating image from URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    return generatePlaceholderImage(params.description);
  }
}

function generatePlaceholderImage(description: string): string {
  const encodedText = encodeURIComponent(description.substring(0, 20));
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#374151"/>
      <text x="100" y="100" fill="#9CA3AF" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle">${description.substring(0, 15)}...</text>
    </svg>
  `)}`;
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
