import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, RefreshCw, Loader2 } from 'lucide-react';
import { type GeneratedAsset } from '../../types';

interface AssetCardProps {
  asset: GeneratedAsset;
  index: number;
  regeneratingAsset?: string | null;
  onViewAsset: (url: string) => void;
  onRegenerateAsset?: (index: number) => void;
  onImageError?: (index: number) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  index,
  regeneratingAsset,
  onViewAsset,
  onRegenerateAsset,
  onImageError,
}) => {
  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'background': return 'bg-blue-600';
      case 'character': return 'bg-green-600';
      case 'prop': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-slate-700 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={`${getAssetTypeColor(asset.asset_type)} text-white text-xs`}>
            {asset.asset_type}
          </Badge>
          <span className="text-white font-medium text-sm">{asset.asset_name}</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewAsset(asset.image_url)}
            className="text-xs px-2 py-1"
          >
            <Eye className="w-3 h-3" />
          </Button>
          {onRegenerateAsset && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRegenerateAsset(index)}
              disabled={regeneratingAsset === asset.asset_name}
              className="text-xs px-2 py-1"
            >
              {regeneratingAsset === asset.asset_name ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-400 text-xs mb-2">Prompt: {asset.prompt}</p>
      <div className="mt-2">
        <img
          src={asset.image_url}
          alt={asset.asset_name}
          className="w-full h-32 object-cover rounded border border-slate-600"
          loading="lazy"
          {...(onImageError && { onError: () => onImageError(index) })}
        />
      </div>
    </div>
  );
};

export default AssetCard;
