import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Image, Palette } from 'lucide-react';
import AssetCard from './scene-generator/AssetCard';
import { useAssetGeneration } from './scene-generator/hooks/useAssetGeneration';
import { type Investigation, type GeneratedAsset, type AssetType } from '../types';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { type GenerateImageParams, getValidImageStyle } from '../utils/imageGenerator';

interface SceneGeneratorProps {
  investigation: Investigation;
  onAssetsGenerated?: (assets: GeneratedAsset[]) => void;
}

const SceneGenerator: React.FC<SceneGeneratorProps> = ({ investigation, onAssetsGenerated }) => {
  const {
    isLoading,
    assets: generatedAssets,
    generateAssets,
    error,
    regeneratingAssetId,
    regenerateAsset,
  } = useAssetGeneration({ investigation });

  useEffect(() => {
    if (!isLoading && generatedAssets.length > 0 && onAssetsGenerated && !regeneratingAssetId) {
      onAssetsGenerated(generatedAssets);
    }
  }, [generatedAssets, isLoading, onAssetsGenerated, regeneratingAssetId]);

  const handleGenerateAssets = () => {
    generateAssets();
  };

  const handleRegenerateAsset = (assetId: string, prompt: string, assetType: AssetType, style?: GenerateImageParams['style']) => {
    if (!regeneratingAssetId) {
      regenerateAsset(assetId, prompt, assetType, style);
    }
  };

  const handleImageError = (asset: GeneratedAsset, index: number) => {
    console.error(`💥 Erreur de chargement pour ${asset.asset_name}:`, asset.image_url);
    toast.error(`Erreur de chargement de l'image "${asset.asset_name}"`);
    if (asset.id && asset.prompt && asset.asset_type) {
      handleRegenerateAsset(asset.id, asset.prompt, asset.asset_type, getValidImageStyle(asset.style));
    } else {
      console.error('Cannot regenerate asset: Missing ID, prompt, or type', asset);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Aperçu des Assets IA (Preview)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3 mb-4">
          <p className="text-blue-200 text-sm">
            ℹ️ <strong>Mode Aperçu :</strong> Les assets sont générés pour prévisualisation uniquement. 
            Ils seront sauvegardés définitivement quand vous démarrerez l'enquête.
          </p>
        </div>

        {investigation.background_prompt && (
          <div className="text-xs text-blue-300 mb-2">Prompt BG: {investigation.background_prompt}</div>
        )}
        {investigation.characters && investigation.characters.map((char) => (
          <div key={char.id} className="text-xs text-purple-300 mb-1">{char.name} - Portrait: {char.portrait_prompt} | BG: {char.dialog_background_prompt}</div>
        ))}
        {investigation.clues && investigation.clues.map((clue) => (
          <div key={clue.id} className="text-xs text-green-300 mb-1">Indice: {clue.name} - Prompt: {clue.image_prompt}</div>
        ))}

        {!generatedAssets.length && !isLoading && !error ? (
          <div className="text-center">
            <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Générez un aperçu des assets visuels 2D avec l'IA basés sur votre enquête
            </p>
            <Button
              onClick={handleGenerateAssets}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Palette className="w-4 h-4 mr-2" />
              Générer Aperçu Assets
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Génération des assets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm mb-4">Erreur lors de la génération des assets: {error}</p>
            <Button
              onClick={handleGenerateAssets}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-300">
                {generatedAssets.length} assets générés (aperçu)
              </div>
            </div>
            
            {generatedAssets.map((asset, index) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={index}
                regeneratingAsset={regeneratingAssetId === asset.id ? asset.asset_name : null}
                onViewAsset={(url) => window.open(url, '_blank')}
                onRegenerateAsset={() => handleRegenerateAsset(asset.id, asset.prompt, asset.asset_type, getValidImageStyle(asset.style))}
                onImageError={() => handleImageError(asset, index)}
              />
            ))}
            
            <Button
              onClick={handleGenerateAssets}
              variant="outline"
              className="w-full mt-4"
              disabled={isLoading || !!regeneratingAssetId}
            >
              <Palette className="w-4 h-4 mr-2" />
              Regénérer Aperçu Assets
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SceneGenerator;
