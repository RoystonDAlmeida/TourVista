import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../services/geminiService';
import { auth, saveNearbyPlaceForUser, getNearbyPlacesForUser } from '../services/firebaseService';
import { useCache } from '../contexts/CacheContext';
import type { LandmarkInfo, NearbyPlace } from '../types';

export const useNearbyPlaces = (landmarkInfo: LandmarkInfo) => {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cacheNearbyPlaces, getNearbyPlaces } = useCache();

  useEffect(() => {
    const getAndSavePlaces = async () => {
      setIsLoading(true);
      setError(null);
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setError('User not authenticated.');
        setIsLoading(false);
        return;
      }

      const cacheKey = `${landmarkInfo.name}-${landmarkInfo.latitude}-${landmarkInfo.longitude}`;

      try {
        // 1. Try to get from client-side cache first
        const cached = getNearbyPlaces(cacheKey);
        if (cached) {
          setPlaces(cached);
          setIsLoading(false);
          return;
        }

        // 2. Try to get saved places from Firebase
        const saved = await getNearbyPlacesForUser(userId);
        if (saved.length > 0) {
          setPlaces(saved);
          cacheNearbyPlaces(cacheKey, saved); // Cache places from Firebase
          setIsLoading(false);
          return;
        }

        // 3. If no saved places, fetch from Gemini Service
        const fetchedPlaces = await fetchNearbyPlaces(landmarkInfo.name, {
          latitude: landmarkInfo.latitude,
          longitude: landmarkInfo.longitude,
        });

        setPlaces(fetchedPlaces);
        cacheNearbyPlaces(cacheKey, fetchedPlaces); // Cache newly fetched places

        // 4. Save newly fetched places to Firebase
        for (const place of fetchedPlaces) {
          await saveNearbyPlaceForUser(userId, place);
        }

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching or saving nearby places.');
      } finally {
        setIsLoading(false);
      }
    };
    getAndSavePlaces();
  }, [landmarkInfo, cacheNearbyPlaces, getNearbyPlaces]);

  return { places, isLoading, error };
};
