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
  const { landmarkInfo, imageUrl, discoveryId } = useLandmarkProcessing();

  useEffect(() => {
    if (landmarkInfo && imageUrl && discoveryId) {
      cacheDiscovery(discoveryId, { landmarkInfo, imageUrl });
      navigate(`/discoveries/${discoveryId}`);
    }
  }, [landmarkInfo, imageUrl, discoveryId, cacheDiscovery, navigate]);

  return <>{children}</>;
};

export default DiscoveryNavigator;