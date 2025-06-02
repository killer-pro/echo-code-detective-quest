
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Image, Download, Palette, Eye, RefreshCw } from 'lucide-react';
import { generateAssetImage, saveGeneratedAssetToDatabase } from '../utils/imageGenerator';
import { assetManager } from '../utils/assetManager';
import { toast } from 'sonner';

interface AssetPrompt {
  type: 'background' | 'character' | 'prop';
  name: string;
  prompt: string;
  style: string;
}

interface GeneratedAsset {
  name: string;
  url: string;
  type: string;
  prompt: string;
}

interface SceneGeneratorProps {
  investigation: any;
  onAssetsGenerated: (assets: { name: string; url: string; type: string }[]) => void;
}

const SceneGenerator: React.FC<SceneGeneratorProps> = ({ investigation, onAssetsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [regeneratingAsset, setRegeneratingAsset] = useState<string | null>(null);

  const generateSceneAssets = async () => {
    setIsGenerating(true);
    
    try {
      const assetPrompts: AssetPrompt[] = investigation.assetPrompts || [];
      const generatedAssetsList: GeneratedAsset[] = [];

      // Configurer l'investigation dans l'asset manager
      assetManager.setCurrentInvestigation(investigation.id);

      for (const assetPrompt of assetPrompts) {
        console.log(`Génération de l'asset: ${assetPrompt.name}`);
        
        let imageUrl: string | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        // Retry logic pour la génération d'image
        while (!imageUrl && retryCount < maxRetries) {
          try {
            imageUrl = await generateAssetImage({
              description: assetPrompt.prompt,
              style: assetPrompt.style as any,
              type: assetPrompt.type
            });
            
            if (imageUrl) {
              // Vérifier que l'image se charge
              await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
                setTimeout(reject, 10000); // Timeout de 10s
              });
            }
          } catch (error) {
            console.warn(`Tentative ${retryCount + 1} échouée pour ${assetPrompt.name}:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant retry
            }
          }
        }

        if (imageUrl) {
          const asset = {
            name: assetPrompt.name,
            url: imageUrl,
            type: assetPrompt.type,
            prompt: assetPrompt.prompt
          };
          
          generatedAssetsList.push(asset);
          
          // Associer les personnages aux assets
          let characterId = undefined;
          if (assetPrompt.type === 'character') {
            const character = investigation.characters?.find((char: any) => 
              assetPrompt.name.toLowerCase().includes(char.name.toLowerCase())
            );
            if (character) {
              characterId = character.id;
            }
          }

          // Ajouter à l'asset manager avec l'ID du personnage
          await assetManager.addAsset({
            name: assetPrompt.name,
            url: imageUrl,
            type: assetPrompt.type,
            characterId
          }, assetPrompt.prompt);
          
          toast.success(`Asset "${assetPrompt.name}" généré avec succès`);
        } else {
          toast.error(`Échec de la génération de "${assetPrompt.name}" après ${maxRetries} tentatives`);
        }
      }

      setGeneratedAssets(generatedAssetsList);
      onAssetsGenerated(generatedAssetsList);
      
    } catch (error) {
      console.error('Erreur lors de la génération des assets:', error);
      toast.error('Erreur lors de la génération des assets');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateAsset = async (assetIndex: number) => {
    const asset = generatedAssets[assetIndex];
    if (!asset) return;

    setRegeneratingAsset(asset.name);
    
    try {
      console.log(`Régénération de l'asset: ${asset.name}`);
      toast.info(`Régénération de "${asset.name}" en cours...`);
      
      let newImageUrl: string | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      // Retry logic pour la régénération
      while (!newImageUrl && retryCount < maxRetries) {
        try {
          // Ajouter un paramètre aléatoire pour forcer une nouvelle génération
          const enhancedPrompt = `${asset.prompt}, variation ${Math.floor(Math.random() * 1000000)}`;
          
          newImageUrl = await generateAssetImage({
            description: enhancedPrompt,
            style: 'cartoon' as any,
            type: asset.type as any
          });
          
          if (newImageUrl) {
            // Vérifier que la nouvelle image se charge
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = newImageUrl;
              setTimeout(reject, 10000);
            });
          }
        } catch (error) {
          console.warn(`Tentative de régénération ${retryCount + 1} échouée:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (newImageUrl) {
        const updatedAssets = [...generatedAssets];
        updatedAssets[assetIndex] = {
          ...asset,
          url: newImageUrl
        };
        
        setGeneratedAssets(updatedAssets);
        onAssetsGenerated(updatedAssets);
        
        // Mettre à jour l'asset manager
        let characterId = undefined;
        if (asset.type === 'character') {
          const character = investigation.characters?.find((char: any) => 
            asset.name.toLowerCase().includes(char.name.toLowerCase())
          );
          if (character) {
            characterId = character.id;
          }
        }

        await assetManager.addAsset({
          name: asset.name,
          url: newImageUrl,
          type: asset.type as any,
          characterId
        }, asset.prompt);
        
        toast.success(`Asset "${asset.name}" régénéré avec succès`);
      } else {
        toast.error(`Échec de la régénération de "${asset.name}" après ${maxRetries} tentatives`);
      }
    } catch (error) {
      console.error(`Erreur lors de la régénération de ${asset.name}:`, error);
      toast.error(`Erreur lors de la régénération de "${asset.name}"`);
    } finally {
      setRegeneratingAsset(null);
    }
  };

  const downloadAsset = async (asset: GeneratedAsset) => {
    setIsDownloading(asset.name);
    
    try {
      // Associer les personnages aux assets character
      let characterId = undefined;
      if (asset.type === 'character') {
        const character = investigation.characters?.find((char: any) => 
          asset.name.toLowerCase().includes(char.name.toLowerCase())
        );
        if (character) {
          characterId = character.id;
        }
      }

      await assetManager.addAsset({
        name: asset.name,
        url: asset.url,
        type: asset.type as any,
        characterId
      }, asset.prompt);
      
      toast.success(`Asset "${asset.name}" ajouté au jeu`);
    } catch (error) {
      console.error(`Erreur lors de l'ajout de ${asset.name}:`, error);
      toast.error(`Erreur lors de l'ajout de "${asset.name}"`);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadAllAssets = async () => {
    setIsDownloading('all');
    
    try {
      for (const asset of generatedAssets) {
        let characterId = undefined;
        if (asset.type === 'character') {
          const character = investigation.characters?.find((char: any) => 
            asset.name.toLowerCase().includes(char.name.toLowerCase())
          );
          if (character) {
            characterId = character.id;
          }
        }

        await assetManager.addAsset({
          name: asset.name,
          url: asset.url,
          type: asset.type as any,
          characterId
        }, asset.prompt);
      }
      
      toast.success('Tous les assets ont été ajoutés au jeu');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de tous les assets:', error);
      toast.error('Erreur lors de l\'ajout des assets');
    } finally {
      setIsDownloading(null);
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'background': return 'bg-blue-600';
      case 'character': return 'bg-green-600';
      case 'prop': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Génération de Scène IA (2D)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedAssets.length ? (
          <div className="text-center">
            <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Générez des assets visuels 2D avec l'IA basés sur votre enquête
            </p>
            <Button
              onClick={generateSceneAssets}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération IA...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 mr-2" />
                  Générer Assets IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-300">
                {generatedAssets.length} assets générés (style 2D)
              </div>
              <Button
                onClick={downloadAllAssets}
                disabled={isDownloading === 'all'}
                className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
              >
                {isDownloading === 'all' ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                Utiliser Tous
              </Button>
            </div>
            
            {generatedAssets.map((asset, index) => (
              <div key={index} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getAssetTypeColor(asset.type)} text-white text-xs`}>
                      {asset.type}
                    </Badge>
                    <span className="text-white font-medium text-sm">{asset.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(asset.url, '_blank')}
                      className="text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateAsset(index)}
                      disabled={regeneratingAsset === asset.name}
                      className="text-xs px-2 py-1"
                    >
                      {regeneratingAsset === asset.name ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsset(asset)}
                      disabled={isDownloading === asset.name}
                      className="text-xs px-2 py-1"
                    >
                      {isDownloading === asset.name ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-2">Prompt: {asset.prompt}</p>
                <div className="mt-2">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-32 object-cover rounded border border-slate-600"
                    loading="lazy"
                    onError={(e) => {
                      console.error(`Erreur de chargement pour ${asset.name}:`, asset.url);
                      toast.error(`Erreur de chargement de l'image "${asset.name}"`);
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+RXJyZXVyIGNoYXJnZW1lbnQ8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
              </div>
            ))}
            
            <Button
              onClick={generateSceneAssets}
              variant="outline"
              className="w-full mt-4"
              disabled={isGenerating}
            >
              <Palette className="w-4 h-4 mr-2" />
              Regénérer Assets IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SceneGenerator;
