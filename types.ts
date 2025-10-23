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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  key: number;
}

export interface NearbyPlace {
  name: string;
  description: string;
  uri: string;
  title: string; // The official title from Google Maps source
}

export interface Language {
  code: string;
  name: string;
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
  createdAt: Date;
}