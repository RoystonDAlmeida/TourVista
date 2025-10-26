import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../services/geminiService';
import type { LandmarkInfo, NearbyPlace } from '../types';

export const useNearbyPlaces = (landmarkInfo: LandmarkInfo) => {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchNearbyPlaces(landmarkInfo.name, {
          latitude: landmarkInfo.latitude,
          longitude: landmarkInfo.longitude,
        });

        setPlaces(result);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching nearby places.');
      } finally {
        setIsLoading(false);
      }
    };
    getPlaces();
  }, [landmarkInfo]);

  return { places, isLoading, error };
};
