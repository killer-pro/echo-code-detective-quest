
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Image, Download, Palette, Eye } from 'lucide-react';
import { generateAssetImage, downloadAndCacheImage } from '../utils/imageGenerator';
import { assetManager } from '../utils/assetManager';

interface AssetPrompt {
  type: 'background' | 'character' | 'prop';
  name: string;
  prompt: string;
  style: string;
}

interface SceneGeneratorProps {
  investigation: any;
  onAssetsGenerated: (assets: { name: string; url: string; type: string }[]) => void;
}

const SceneGenerator: React.FC<SceneGeneratorProps> = ({ investigation, onAssetsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<Array<{ name: string; url: string; type: string; prompt: string }>>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const generateSceneAssets = async () => {
    setIsGenerating(true);
    
    try {
      const assetPrompts: AssetPrompt[] = investigation.assetPrompts || [];
      const generatedAssetsList: Array<{ name: string; url: string; type: string; prompt: string }> = [];

      for (const assetPrompt of assetPrompts) {
        console.log(`Génération de l'asset: ${assetPrompt.name}`);
        
        const imageUrl = await generateAssetImage({
          description: assetPrompt.prompt,
          style: assetPrompt.style as any,
          type: assetPrompt.type
        });

        if (imageUrl) {
          generatedAssetsList.push({
            name: assetPrompt.name,
            url: imageUrl,
            type: assetPrompt.type,
            prompt: assetPrompt.prompt
          });
        }
      }

      setGeneratedAssets(generatedAssetsList);
      onAssetsGenerated(generatedAssetsList);
      
    } catch (error) {
      console.error('Erreur lors de la génération des assets:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsset = async (asset: { name: string; url: string; type: string }) => {
    setIsDownloading(asset.name);
    
    try {
      const cachedUrl = await downloadAndCacheImage(asset.url, asset.name);
      
      // Ajouter à l'asset manager
      await assetManager.downloadAsset({
        name: asset.name,
        url: cachedUrl,
        type: asset.type as any
      });
      
      console.log(`Asset ${asset.name} téléchargé et mis en cache`);
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${asset.name}:`, error);
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
          Génération de Scène IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedAssets.length ? (
          <div className="text-center">
            <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Générez des assets visuels avec l'IA basés sur votre enquête
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
            <div className="text-sm text-gray-300 mb-3">
              {generatedAssets.length} assets générés par l'IA pour votre enquête
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(asset.url, '_blank')}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsset(asset)}
                      disabled={isDownloading === asset.name}
                      className="text-xs"
                    >
                      {isDownloading === asset.name ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      Utiliser
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
