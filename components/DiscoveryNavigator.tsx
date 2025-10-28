import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCache } from '../contexts/CacheContext';
import { useLandmarkProcessing } from '../hooks/useLandmarkProcessing';

interface DiscoveryNavigatorProps {
  children: React.ReactNode;
}

const DiscoveryNavigator: React.FC<DiscoveryNavigatorProps> = ({ children }) => {
  const navigate = useNavigate();
  const { cacheDiscovery } = useCache();
  const { landmarkInfo, imageUrl, discoveryId, selectedLanguage } = useLandmarkProcessing(navigate);

  useEffect(() => {
    if (landmarkInfo && imageUrl && discoveryId) {
      cacheDiscovery(discoveryId, { landmarkInfo, imageUrl, language: selectedLanguage }, selectedLanguage);
      navigate(`/discoveries/${discoveryId}`);
    }
  }, [landmarkInfo, imageUrl, discoveryId, cacheDiscovery, navigate, selectedLanguage]);

  return <>{children}</>;
};

export default DiscoveryNavigator;