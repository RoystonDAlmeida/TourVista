import { useState, useCallback } from 'react';
import { getLandmarkInfoFromImage, generateNarration, fetchSpokenLanguages } from '../services/geminiService';
import { saveDiscoveryForUser, auth } from '../services/firebaseService';
import type { LandmarkInfo, Language } from '../types';
import { VOICES } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { useCache } from '../contexts/CacheContext';
import toast from 'react-hot-toast';

// Function to upload image to backend
export const uploadImageToBackend = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image to backend');
  }

  const data = await response.json();
  return data.url;
};

export const useLandmarkProcessing = (navigate: (path: string) => void) => {
  const { clearDiscoveryListCache, cacheDiscovery } = useCache();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [landmarkInfo, setLandmarkInfo] = useState<LandmarkInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState<boolean>(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([{ code: 'English', name: 'English' }]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);

  const resetState = useCallback(() => {
    setImageFile(null);
    setImageUrl('');
    setLandmarkInfo(null);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setAudioData(null);
    setAvailableLanguages([{ code: 'English', name: 'English' }]);
    setSelectedLanguage('English');
    setDiscoveryId(null); // Reset discoveryId
    setIsGeneratingNarration(false); // Reset narration loading state
  }, []);

  const processLandmarkInfoAndNarration = useCallback(async (file: File, language: string) => {
    try {
      setIsGeneratingNarration(true); // Start narration loading
      setLoadingMessage('Translating info & fetching history...'); // Keep this for initial translation
      const info = await getLandmarkInfoFromImage(file, language); // Use the provided language
      setLandmarkInfo(info);
      // Update the cache with the newly translated landmark info
      if (discoveryId && imageUrl) {
        cacheDiscovery(discoveryId, { landmarkInfo: info, imageUrl: imageUrl, language: language }, language);
      }

      setLoadingMessage('Generating new narration...');
      const narration = await generateNarration(info.history, selectedVoice, language); // Use the provided language
      setAudioData(narration);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during re-translation.');
    } finally {
      setIsGeneratingNarration(false); // End narration loading
    }
  }, [selectedVoice, discoveryId, imageUrl, cacheDiscovery]); // Added discoveryId, imageUrl, and cacheDiscovery to dependency array

  // Handle image upload, get landmark info, local languages and generate narration.
  const handleImageUpload = useCallback(async (file: File) => {
    resetState();
    setImageFile(file);

    // Set a local URL for immediate preview
    const localImageUrl = URL.createObjectURL(file);
    
    setImageUrl(localImageUrl);
    setError(null);
    setIsLoading(true);
  
    try {
      setLoadingMessage('Uploading image...');
      const uploadedImageUrl = await uploadImageToBackend(file);
      setImageUrl(uploadedImageUrl); // Update with the remote URL

      setLoadingMessage('Identifying landmark & fetching info...');
      const initialInfo = await getLandmarkInfoFromImage(file, 'English');

      setLoadingMessage('Generating narration...');
      const [languages, narration] = await Promise.all([
        fetchSpokenLanguages(initialInfo?.countryCode),
        generateNarration(initialInfo.history, selectedVoice, 'English')
      ]);

      setAudioData(narration);
  
      setLandmarkInfo(initialInfo);
      const uniqueLanguages = [
        { code: 'English', name: 'English' },
        ...languages.filter(l => l.code.toLowerCase() !== 'english')
      ];
      setAvailableLanguages(uniqueLanguages);

      let currentDiscoveryId = uuidv4(); // Generate a temporary ID
      if (auth.currentUser) {
        // If user is logged in, save to Firebase and get the real ID
        currentDiscoveryId = await saveDiscoveryForUser(auth.currentUser.uid, { 
          landmarkInfo: initialInfo, 
          languages: uniqueLanguages,
          imageUrl: uploadedImageUrl,
        });
        clearDiscoveryListCache(); // Clear the cache after saving a new discovery
      }
      // Cache the initial discovery with the language it was fetched in
      cacheDiscovery(currentDiscoveryId, { landmarkInfo: initialInfo, imageUrl: uploadedImageUrl, language: 'English' }, 'English');
      setDiscoveryId(currentDiscoveryId); // Set the discoveryId in state

      if (currentDiscoveryId) {
        toast.success('Discovery complete! Redirecting...');
        setTimeout(() => {
          navigate(`/discoveries/${currentDiscoveryId}`);
        }, 1000); // Redirect after 1 seconds
      }
  
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [resetState, selectedVoice, clearDiscoveryListCache, navigate]);  

  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    if (newLanguage !== selectedLanguage && imageFile && landmarkInfo) { // Added landmarkInfo check
      setSelectedLanguage(newLanguage);
      setError(null);
      // setIsLoading(true); // Removed, as isGeneratingNarration will handle this
      await processLandmarkInfoAndNarration(imageFile, newLanguage);
      // setIsLoading(false); // Removed
    }
  }, [selectedLanguage, imageFile, landmarkInfo, processLandmarkInfoAndNarration]);

  const handleVoiceChange = useCallback(async (newVoiceId: string) => {
    if (newVoiceId !== selectedVoice && imageFile && landmarkInfo) {
      setSelectedVoice(newVoiceId);
      setError(null);
      
      // processLandmarkInfoAndNarration will handle isGeneratingNarration
      await processLandmarkInfoAndNarration(imageFile, selectedLanguage);
    }
  }, [selectedVoice, imageFile, landmarkInfo, selectedLanguage, processLandmarkInfoAndNarration]); // Added landmarkInfo to dependency array

  return {
    // State
    imageFile,
    imageUrl,
    landmarkInfo,
    isLoading,
    loadingMessage,
    error,
    selectedLanguage,
    availableLanguages,
    selectedVoice,
    audioData,
    discoveryId, // Return discoveryId
    isGeneratingNarration, // Return new state

    // Actions
    setSelectedVoice, 
    handleImageUpload,
    handleLanguageChange,
    handleVoiceChange, // Return new action
    resetState,
    setError
  };
};