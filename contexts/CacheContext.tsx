import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { LandmarkInfo, SavedDiscovery, SavedItinerary } from '../types';

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
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const DISCOVERY_CACHE_KEY = 'discovery_cache';
const DISCOVERY_LIST_CACHE_KEY = 'discovery_list_cache';
const ITINERARY_CACHE_KEY = 'itinerary_cache';

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

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DISCOVERY_CACHE_KEY, JSON.stringify(Array.from(discoveryCache.entries())));
    } catch (error) {
      console.error("Error writing discovery cache to sessionStorage", error);
    }
  }, [discoveryCache]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DISCOVERY_LIST_CACHE_KEY, JSON.stringify(cachedDiscoveryList));
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
    return cachedDiscoveryList;
  }, [cachedDiscoveryList]);

  const cacheItineraries = useCallback((itineraries: SavedItinerary[]) => {
    setCachedItineraries(itineraries);
  }, []);

  const getCachedItineraries = useCallback(() => {
    return cachedItineraries;
  }, [cachedItineraries]);

  const clearItineraryCache = useCallback(() => {
    setCachedItineraries(undefined);
  }, []);

  return (
    <CacheContext.Provider value={{ cacheDiscovery, getDiscovery, cacheDiscoveryList, getDiscoveryList, cacheItineraries, getCachedItineraries, clearItineraryCache }}>
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