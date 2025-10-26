export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri: string;
        title: string;
        text: string;
      }[];
    }[];
  };
}

export interface LandmarkInfo {
  name: string;
  history: string;
  sources: GroundingChunk[];
  latitude: number;
  longitude: number;
  countryCode: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  key?: number; // Make key optional, as it's for UI rendering, not Firestore storage
  timestamp?: Date; // Add timestamp for Firestore
}

export interface Conversation {
  id?: string; // Firestore document ID
  userId: string;
  discoveryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NearbyPlace {
  name: string;
  description: string;
  uri: string;
  title: string; // The official title from Google Maps source
  latitude?: number;
  longitude?: number;
}

export interface Language {
  code: string;
  name: string;
}

export interface AudioData {
  audioContent: string;
  languageCode: string;
  voice: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface SavedItinerary {
  id: string;
  landmarkName: string;
  duration: string;
  interests: string;
  itineraryContent: string;
  createdAt: Date | string;
}

export interface SavedDiscovery {
  id: string;
  landmarkInfo: LandmarkInfo;
  languages: Language[];
  createdAt: Date | string;
  imageUrl: string;
  timeline?: string;
}