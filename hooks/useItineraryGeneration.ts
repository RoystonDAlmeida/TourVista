import { useState, useCallback } from 'react';
import { generateItinerary } from '../services/geminiService';
import { saveItineraryForUser } from '../services/firebaseService';
import type { LandmarkInfo, AppUser } from '../types';

interface UseItineraryGenerationProps {
  user: AppUser;
  landmarkInfo: LandmarkInfo;
  discoveryId: string;
}

export const useItineraryGeneration = ({ user, landmarkInfo, discoveryId }: UseItineraryGenerationProps) => {
  const [duration, setDuration] = useState('Full Day'); // Default duration
  const [interests, setInterests] = useState('history, food, and photography');
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setItinerary(null);
      const result = await generateItinerary(landmarkInfo, duration, interests);
      setItinerary(result);

      // Save to Firestore
      await saveItineraryForUser(user.uid, {
          discoveryId: discoveryId,
          duration,
          interests,
          itineraryContent: result
        });

    } catch (err: any) {
      setError(err.message || "An error occurred while generating the itinerary.");
    } finally {
      setIsLoading(false);
    }
  }, [user, landmarkInfo, duration, interests]);

  return {
    duration,
    setDuration,
    interests,
    setInterests,
    itinerary,
    isLoading,
    error,
    handleSubmit,
  };
};
