import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { LandmarkInfo, SavedDiscovery, SavedItinerary, NearbyPlace, Postcard } from '../types';

interface CachedDiscovery {
  landmarkInfo: LandmarkInfo;
  imageUrl: string;
}

interface CacheContextType {
  cacheDiscovery: (id: string, discovery: CachedDiscovery) => void;
  getDiscovery: (id: string) => CachedDiscovery | undefined;
  cacheDiscoveryList: (discoveries: SavedDiscovery[]) => void;
  getDiscoveryList: () => SavedDiscovery[] | undefined;
  cacheItineraries: (itineraries: SavedItinerary[]) => void;
  getCachedItineraries: () => SavedItinerary[] | undefined;
  clearItineraryCache: () => void;
  cacheConversationId: (discoveryId: string, conversationId: string) => void;
  getConversationId: (discoveryId: string) => string | undefined;
  cacheTimeline: (discoveryId: string, timeline: string) => void;
  getTimeline: (discoveryId: string) => string | undefined;
  cacheNearbyPlaces: (queryKey: string, places: NearbyPlace[]) => void;
  getNearbyPlaces: (queryKey: string) => NearbyPlace[] | undefined;
  cachePostcards: (postcards: Postcard[]) => void;
  getCachedPostcards: () => Postcard[] | undefined;
  clearPostcardCache: () => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const DISCOVERY_CACHE_KEY = 'discovery_cache';
const DISCOVERY_LIST_CACHE_KEY = 'discovery_list_cache';
const ITINERARY_CACHE_KEY = 'itinerary_cache';
const POSTCARD_CACHE_KEY = 'postcard_cache';
const CONVERSATION_ID_CACHE_KEY = 'conversation_id_cache';
const TIMELINE_CACHE_KEY = 'timeline_cache';
const NEARBY_PLACES_CACHE_KEY = 'nearby_places_cache';

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [discoveryCache, setDiscoveryCache] = useState<Map<string, CachedDiscovery>>(() => {
    try {
      const item = window.sessionStorage.getItem(DISCOVERY_CACHE_KEY);
      return item ? new Map(JSON.parse(item)) : new Map();
    } catch (error) {
      console.error("Error reading discovery cache from sessionStorage", error);
      return new Map();
    }
  });

  const [cachedDiscoveryList, setCachedDiscoveryList] = useState<SavedDiscovery[] | undefined>(() => {
    try {
      const item = window.sessionStorage.getItem(DISCOVERY_LIST_CACHE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.map((discovery: any) => ({
          ...discovery,
          createdAt: new Date(discovery.createdAt),
        }));
      }
      return undefined;
    } catch (error) {
      console.error("Error reading discovery list cache from sessionStorage", error);
      return undefined;
    }
  });

  const [cachedItineraries, setCachedItineraries] = useState<SavedItinerary[] | undefined>(() => {
    try {
      const item = window.sessionStorage.getItem(ITINERARY_CACHE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.map((itinerary: any) => ({
          ...itinerary,
          createdAt: new Date(itinerary.createdAt),
        }));
      }
      return undefined;
    } catch (error) {
      console.error("Error reading itinerary cache from sessionStorage", error);
      return undefined;
    }
  });

  const [cachedPostcards, setCachedPostcards] = useState<Postcard[] | undefined>(() => {
    try {
      const item = window.sessionStorage.getItem(POSTCARD_CACHE_KEY);
      if (item) {
        return JSON.parse(item);
      }
      return undefined;
    } catch (error) {
      console.error("Error reading postcard cache from sessionStorage", error);
      return undefined;
    }
  });

  const [conversationIdCache, setConversationIdCache] = useState<Map<string, string>>(() => {
    try {
      const item = window.sessionStorage.getItem(CONVERSATION_ID_CACHE_KEY);
      return item ? new Map(JSON.parse(item)) : new Map();
    } catch (error) {
      console.error("Error reading conversation ID cache from sessionStorage", error);
      return new Map();
    }
  });

  const [timelineCache, setTimelineCache] = useState<Map<string, string>>(() => {
    try {
      const item = window.sessionStorage.getItem(TIMELINE_CACHE_KEY);
      return item ? new Map(JSON.parse(item)) : new Map();
    } catch (error) {
      console.error("Error reading timeline cache from sessionStorage", error);
      return new Map();
    }
  });

  const [nearbyPlacesCache, setNearbyPlacesCache] = useState<Map<string, NearbyPlace[]>>(() => {
    try {
      const item = window.sessionStorage.getItem(NEARBY_PLACES_CACHE_KEY);
      return item ? new Map(JSON.parse(item)) : new Map();
    } catch (error) {
      console.error("Error reading nearby places cache from sessionStorage", error);
      return new Map();
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DISCOVERY_CACHE_KEY, JSON.stringify(Array.from(discoveryCache.entries())));
    } catch (error) {
      console.error("Error writing discovery cache to sessionStorage", error);
    }
  }, [discoveryCache]);

  useEffect(() => {
    try {
      if (cachedDiscoveryList) {
        window.sessionStorage.setItem(DISCOVERY_LIST_CACHE_KEY, JSON.stringify(cachedDiscoveryList));
      } else {
        window.sessionStorage.removeItem(DISCOVERY_LIST_CACHE_KEY);
      }
    } catch (error) {
      console.error("Error writing discovery list cache to sessionStorage", error);
    }
  }, [cachedDiscoveryList]);

  useEffect(() => {
    try {
      if (cachedItineraries) {
        window.sessionStorage.setItem(ITINERARY_CACHE_KEY, JSON.stringify(cachedItineraries));
      } else {
        window.sessionStorage.removeItem(ITINERARY_CACHE_KEY);
      }
    } catch (error) {
      console.error("Error writing itinerary cache to sessionStorage", error);
    }
  }, [cachedItineraries]);

  useEffect(() => {
    try {
      if (cachedPostcards) {
        window.sessionStorage.setItem(POSTCARD_CACHE_KEY, JSON.stringify(cachedPostcards));
      } else {
        window.sessionStorage.removeItem(POSTCARD_CACHE_KEY);
      }
    } catch (error) {
      console.error("Error writing postcard cache to sessionStorage", error);
    }
  }, [cachedPostcards]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CONVERSATION_ID_CACHE_KEY, JSON.stringify(Array.from(conversationIdCache.entries())));
    } catch (error) {
      console.error("Error writing conversation ID cache to sessionStorage", error);
    }
  }, [conversationIdCache]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(TIMELINE_CACHE_KEY, JSON.stringify(Array.from(timelineCache.entries())));
    } catch (error) {
      console.error("Error writing timeline cache to sessionStorage", error);
    }
  }, [timelineCache]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(NEARBY_PLACES_CACHE_KEY, JSON.stringify(Array.from(nearbyPlacesCache.entries())));
    } catch (error) {
      console.error("Error writing nearby places cache to sessionStorage", error);
    }
  }, [nearbyPlacesCache]);

  const cacheDiscovery = useCallback((id: string, discovery: CachedDiscovery) => {
    setDiscoveryCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(id, discovery);
      return newCache;
    });
  }, []);

  const getDiscovery = useCallback((id: string) => {
    return discoveryCache.get(id);
  }, [discoveryCache]);

  const cacheDiscoveryList = useCallback((discoveries: SavedDiscovery[]) => {
    setCachedDiscoveryList(discoveries);
  }, []);

  const getDiscoveryList = useCallback(() => {
    try {
      const item = window.sessionStorage.getItem(DISCOVERY_LIST_CACHE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.map((discovery: any) => ({
          ...discovery,
          createdAt: new Date(discovery.createdAt),
        }));
      }
      return undefined;
    } catch (error) {
      console.error("Error reading discovery list cache from sessionStorage", error);
      return undefined;
    }
  }, []);

  const cacheItineraries = useCallback((itineraries: SavedItinerary[]) => {
    setCachedItineraries(itineraries);
  }, []);

  const getCachedItineraries = useCallback(() => {
    try {
      const item = window.sessionStorage.getItem(ITINERARY_CACHE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.map((itinerary: any) => ({
          ...itinerary,
          createdAt: new Date(itinerary.createdAt),
        }));
      }
      return undefined;
    } catch (error) {
      console.error("Error reading itinerary cache from sessionStorage", error);
      return undefined;
    }
  }, []);

  const clearItineraryCache = useCallback(() => {
    setCachedItineraries(undefined);
  }, []);

  const cachePostcards = useCallback((postcards: Postcard[]) => {
    setCachedPostcards(postcards);
  }, []);

  const getCachedPostcards = useCallback(() => {
    try {
      const item = window.sessionStorage.getItem(POSTCARD_CACHE_KEY);
      if (item) {
        return JSON.parse(item);
      }
      return undefined;
    } catch (error) {
      console.error("Error reading postcard cache from sessionStorage", error);
      return undefined;
    }
  }, []);

  const clearPostcardCache = useCallback(() => {
    setCachedPostcards(undefined);
  }, []);

  const cacheConversationId = useCallback((discoveryId: string, conversationId: string) => {
    setConversationIdCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(discoveryId, conversationId);
      return newCache;
    });
  }, []);

  const getConversationId = useCallback((discoveryId: string) => {
    return conversationIdCache.get(discoveryId);
  }, [conversationIdCache]);

  const cacheTimeline = useCallback((discoveryId: string, timeline: string) => {
    setTimelineCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(discoveryId, timeline);
      return newCache;
    });
  }, []);

  const getTimeline = useCallback((discoveryId: string) => {
    return timelineCache.get(discoveryId);
  }, [timelineCache]);

  const cacheNearbyPlaces = useCallback((queryKey: string, places: NearbyPlace[]) => {
    setNearbyPlacesCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(queryKey, places);
      return newCache;
    });
  }, []);

  const getNearbyPlaces = useCallback((queryKey: string) => {
    return nearbyPlacesCache.get(queryKey);
  }, [nearbyPlacesCache]);

  return (
    <CacheContext.Provider value={{
      cacheDiscovery,
      getDiscovery,
      cacheDiscoveryList,
      getDiscoveryList,
      cacheItineraries,
      getCachedItineraries,
      clearItineraryCache,
      cacheConversationId,
      getConversationId,
      cacheTimeline,
      getTimeline,
      cacheNearbyPlaces,
      getNearbyPlaces,
      cachePostcards,
      getCachedPostcards,
      clearPostcardCache,
    }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};
