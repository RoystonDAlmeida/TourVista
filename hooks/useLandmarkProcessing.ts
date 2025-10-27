import { useState, useCallback } from 'react';
import { getLandmarkInfoFromImage, generateNarration, fetchSpokenLanguages } from '../services/geminiService';
import { saveDiscoveryForUser, auth } from '../services/firebaseService';
import type { LandmarkInfo, Language } from '../types';
import { VOICES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

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

export const useLandmarkProcessing = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [landmarkInfo, setLandmarkInfo] = useState<LandmarkInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [discoveryId, setDiscoveryId] = useState<string | null>(null);
  
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
  }, []);

  const processLandmarkInfoAndNarration = useCallback(async (file: File, language: string) => {
    try {
      setLoadingMessage('Translating info & fetching history...');
      const info = await getLandmarkInfoFromImage(file, language);
      setLandmarkInfo(info);
      
      setLoadingMessage('Generating new narration...');
      const narration = await generateNarration(info.history, selectedVoice, language);
      setAudioData(narration);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during re-translation.');
    }
  }, [selectedVoice]);

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
      }
      setDiscoveryId(currentDiscoveryId); // Set the discoveryId in state
  
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [resetState, selectedVoice]);  

  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    if (newLanguage !== selectedLanguage && imageFile) {
      setSelectedLanguage(newLanguage);
      setError(null);
      setIsLoading(true);
      await processLandmarkInfoAndNarration(imageFile, newLanguage);
      setIsLoading(false);
    }
  }, [selectedLanguage, imageFile, processLandmarkInfoAndNarration]);

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
    
    // Actions
    setSelectedVoice,
    handleImageUpload,
    handleLanguageChange,
    resetState,
    setError
  };
};