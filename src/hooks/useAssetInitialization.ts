
import { useState } from 'react';
import { assetManager } from '../utils/assetManager';

export const useAssetInitialization = () => {
  const [assetsInitialized, setAssetsInitialized] = useState(false);

  const markAsInitialized = () => {
    setAssetsInitialized(true);
  };

  const resetInitialization = () => {
    setAssetsInitialized(false);
  };

  const isManagerReady = () => {
    return assetManager.isAssetManagerReady();
  };

  return {
    assetsInitialized,
    markAsInitialized,
    resetInitialization,
    isManagerReady,
  };
};
