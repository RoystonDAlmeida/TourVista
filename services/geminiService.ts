import type { LandmarkInfo, GroundingChunk, NearbyPlace, Language, ChatMessage } from '../types';
import { fileToBase64 } from "../utils/fileUtils";

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function getLandmarkInfoFromImage(imageFile: File, language: string): Promise<LandmarkInfo> {
    try {
        const base64Image = await fileToBase64(imageFile);
        const data = await apiFetch<LandmarkInfo>('landmark-info', {
            image: base64Image,
            mimeType: imageFile.type,
            language,
        });
        return data;
    } catch (error: any) {
        console.error("Error analyzing image:", error);
        throw new Error(error.message || "Failed to identify the landmark or fetch its details. Please try another photo.");
    }
}

export async function generateNarration(text: string, voice: string, language: string): Promise<string> {
  try {
    const { audio } = await apiFetch<{ audio: string }>('narrate', { text, voice, language });
    if (!audio) {
      throw new Error("No audio data received from API.");
    }
    return audio;
  } catch (error: any) {
    console.error("Error generating narration:", error);
    throw new Error(error.message || "Failed to generate audio narration.");
  }
}

export async function fetchSpokenLanguages(countryCode: string): Promise<Language[]> {
  try {
    const languages = await apiFetch<Language[]>('languages', { countryCode });
    return languages;
  } catch (error: any) {
    console.error("Error fetching spoken languages:", error);
    // Return a default so the app doesn't break
    return [];
  }
}

export async function fetchNearbyPlaces(landmarkName: string, coords: { latitude: number; longitude: number; }): Promise<NearbyPlace[]> {
  try {
    const { placesFromText, sources } = await apiFetch<{ placesFromText: {name: string, description: string}[], sources: GroundingChunk[] }>('nearby-places', { landmarkName, coords });
    
    const findBestSource = (name: string): GroundingChunk | undefined => {
        const lowerCaseName = name.toLowerCase();
        // Prioritize exact or near-exact matches
        return sources.find(s => s.maps!.title.toLowerCase() === lowerCaseName) || 
               sources.find(s => s.maps!.title.toLowerCase().includes(lowerCaseName)) ||
               sources.find(s => lowerCaseName.includes(s.maps!.title.toLowerCase()));
    };
    
    const enhancedPlaces: NearbyPlace[] = placesFromText.map(place => {
        const bestSource = findBestSource(place.name);
        return {
            name: place.name,
            description: place.description,
            uri: bestSource?.maps?.uri || '',
            title: bestSource?.maps?.title || place.name
        };
    }).filter(p => p.uri); // Only include places we could find a map link for

    return enhancedPlaces;

  } catch (error: any) {
    console.error("Error fetching nearby places:", error);
    throw new Error(error.message || "Failed to fetch nearby places.");
  }
}

export async function generatePostcard(imageFile: File, stylePrompt: string): Promise<string> {
  try {
    const base64Image = await fileToBase64(imageFile);
    const { image } = await apiFetch<{ image: string }>('postcard', {
        image: base64Image,
        mimeType: imageFile.type,
        stylePrompt
    });
    if (!image) {
      throw new Error("No image was generated.");
    }
    return image;
  } catch (error: any) {
    console.error("Error generating postcard:", error);
    throw new Error(error.message || "Failed to generate the postcard. Please try a different style.");
  }
}

export async function generateItinerary(landmarkInfo: LandmarkInfo, duration: string, interests: string): Promise<string> {
  try {
    const { itinerary } = await apiFetch<{ itinerary: string }>('itinerary', { landmarkInfo, duration, interests });
    return itinerary;
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    throw new Error(error.message || "Failed to generate a personalized itinerary. The model might be busy, please try again.");
  }
}

export async function generateTimeline(landmarkInfo: LandmarkInfo): Promise<string> {
  try {
    const { timeline } = await apiFetch<{ timeline: string }>('timeline', { landmarkInfo });
    return timeline;
  } catch (error: any) {
    console.error("Error generating timeline:", error);
    throw new Error(error.message || "Failed to generate a historical timeline. The model might be busy, please try again.");
  }
}

// The chat function is now different. It takes the whole context and returns a stream.
export async function streamChatResponse(
    history: Omit<ChatMessage, 'key'>[], 
    message: string, 
    landmarkInfo: LandmarkInfo, 
    onChunk: (chunk: string) => void
): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message, landmarkInfo }),
    });

    if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => ({ error: 'An unknown chat error occurred' }));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        onChunk(decoder.decode(value, { stream: true }));
    }
}
