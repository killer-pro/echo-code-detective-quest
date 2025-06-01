
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Image, Download, Palette } from 'lucide-react';

interface AssetSuggestion {
  type: 'background' | 'character' | 'prop';
  name: string;
  url: string;
  description: string;
}

interface SceneGeneratorProps {
  investigation: any;
  onAssetsGenerated: (assets: AssetSuggestion[]) => void;
}

const SceneGenerator: React.FC<SceneGeneratorProps> = ({ investigation, onAssetsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<AssetSuggestion[]>([]);

  const generateSceneAssets = async () => {
    setIsGenerating(true);
    
    try {
      // Simulation de génération d'assets basée sur l'enquête
      const sceneContext = `${investigation.title}: ${investigation.description}`;
      
      // Assets suggérés basés sur le contexte
      const suggestedAssets: AssetSuggestion[] = [
        // Arrière-plans
        {
          type: 'background',
          name: 'Manor Interior',
          url: 'https://opengameart.org/sites/default/files/mansion_interior.png',
          description: 'Intérieur de manoir victorien'
        },
        {
          type: 'background',
          name: 'Village Square',
          url: 'https://opengameart.org/sites/default/files/village_square.png',
          description: 'Place de village rustique'
        },
        {
          type: 'background',
          name: 'Office Building',
          url: 'https://opengameart.org/sites/default/files/office_interior.png',
          description: 'Bureau moderne'
        },
        
        // Personnages
        {
          type: 'character',
          name: 'Butler Sprite',
          url: 'https://opengameart.org/sites/default/files/butler_sprite.png',
          description: 'Majordome en costume'
        },
        {
          type: 'character',
          name: 'Detective Sprite',
          url: 'https://opengameart.org/sites/default/files/detective_sprite.png',
          description: 'Enquêteur en imperméable'
        },
        {
          type: 'character',
          name: 'Maid Sprite',
          url: 'https://opengameart.org/sites/default/files/maid_sprite.png',
          description: 'Femme de chambre'
        },
        
        // Props/Objets
        {
          type: 'prop',
          name: 'Evidence Box',
          url: 'https://opengameart.org/sites/default/files/evidence_box.png',
          description: 'Boîte à indices'
        },
        {
          type: 'prop',
          name: 'Magnifying Glass',
          url: 'https://opengameart.org/sites/default/files/magnifying_glass.png',
          description: 'Loupe d\'enquêteur'
        }
      ];

      // Filtrer les assets pertinents selon le contexte
      const contextKeywords = sceneContext.toLowerCase();
      const relevantAssets = suggestedAssets.filter(asset => {
        if (contextKeywords.includes('manoir') || contextKeywords.includes('manor')) {
          return asset.name.toLowerCase().includes('manor') || asset.name.toLowerCase().includes('butler');
        }
        if (contextKeywords.includes('bureau') || contextKeywords.includes('office')) {
          return asset.name.toLowerCase().includes('office') || asset.name.toLowerCase().includes('detective');
        }
        if (contextKeywords.includes('village')) {
          return asset.name.toLowerCase().includes('village') || asset.name.toLowerCase().includes('maid');
        }
        return true; // Garder tous les assets par défaut
      });

      setGeneratedAssets(relevantAssets);
      onAssetsGenerated(relevantAssets);
      
    } catch (error) {
      console.error('Erreur lors de la génération des assets:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsset = async (asset: AssetSuggestion) => {
    try {
      // Simulation du téléchargement
      console.log(`Téléchargement de ${asset.name} depuis ${asset.url}`);
      
      // Ici, dans un vrai projet, on ferait:
      // 1. Fetch de l'URL de l'asset
      // 2. Convertir en blob
      // 3. Sauvegarder dans le dossier public/assets/
      
      const response = await fetch(asset.url);
      if (response.ok) {
        console.log(`Asset ${asset.name} téléchargé avec succès`);
      }
    } catch (error) {
      console.error(`Erreur lors du téléchargement de ${asset.name}:`, error);
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
          Génération de Scène
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedAssets.length ? (
          <div className="text-center">
            <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Générez des assets visuels basés sur votre enquête
            </p>
            <Button
              onClick={generateSceneAssets}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 mr-2" />
                  Générer Assets
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-300 mb-3">
              {generatedAssets.length} assets suggérés pour votre enquête
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadAsset(asset)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Télécharger
                  </Button>
                </div>
                <p className="text-gray-400 text-xs">{asset.description}</p>
                <div className="mt-2">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-20 object-cover rounded border border-slate-600"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNDAiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QXNzZXQgUHJldmlldzwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                </div>
              </div>
            ))}
            
            <Button
              onClick={generateSceneAssets}
              variant="outline"
              className="w-full mt-4"
            >
              <Palette className="w-4 h-4 mr-2" />
              Regénérer Assets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SceneGenerator;
