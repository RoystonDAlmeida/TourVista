import React, { useState } from 'react';
import type { LandmarkInfo } from '../types';
import Loader from './Loader';
import { MapView } from './nearby/MapView';
import { PlacesCarousel } from './nearby/PlacesCarousel';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';

const NearbyPlaces: React.FC<{ landmarkInfo: LandmarkInfo }> = ({ landmarkInfo }) => {
  const { places, isLoading, error } = useNearbyPlaces(landmarkInfo);
  const [mapQuery, setMapQuery] = useState(landmarkInfo.name);

  const handleShowOnMap = (name: string, latitude: number, longitude: number) => {
    setMapQuery(`${name} @ ${latitude},${longitude}`);
  };

  if (isLoading) {
    return <div className="p-6 flex justify-center items-center h-full min-h-[30rem]"><Loader message={`Finding places near ${landmarkInfo.name}...`}/></div>;
  }

  if (error) {
    return <div className="p-6 text-red-300">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-b-lg">
      <h3 className="text-2xl font-bold text-cyan-300 mb-4">What's Nearby?</h3>
      
      <MapView mapQuery={mapQuery} />

      {Array.isArray(places) && places.length > 0 ? (
        <PlacesCarousel 
          places={places} 
          onShowOnMap={handleShowOnMap} 
        />
      ) : (
        <p className="text-center text-slate-400 py-8">No saved nearby places found. Explore to save some!</p>
      )}
    </div>
  );
};

export default NearbyPlaces;