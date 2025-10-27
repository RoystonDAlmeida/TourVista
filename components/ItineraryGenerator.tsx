import React from 'react';
import type { LandmarkInfo, AppUser } from '../types';
import { useItineraryGeneration } from '../hooks/useItineraryGeneration';
import ItineraryForm from './ItineraryForm';
import GeneratedItineraryDisplay from './GeneratedItineraryDisplay';
import ItineraryDisplay from './ItineraryDisplay';

const ItineraryGenerator: React.FC<{ user: AppUser; landmarkInfo: LandmarkInfo; discoveryId: string; }> = ({ user, landmarkInfo, discoveryId }) => {
  const {
    duration,
    setDuration,
    interests,
    setInterests,
    itinerary,
    isLoading,
    error,
    handleSubmit,
  } = useItineraryGeneration({ user, landmarkInfo, discoveryId });

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-b-lg">
      <h3 className="text-2xl font-bold text-cyan-300 mb-2">Personalized Itinerary Planner</h3>
      <p className="text-slate-400 mb-6">Tell us your interests, and we'll create a custom tour plan starting from {landmarkInfo.name}.</p>
      
      {/* Display all generated itineraries */}
      <div className="mb-8">
        <ItineraryDisplay
          userId={user.uid}
          discoveryId={discoveryId}
          landmarkName={landmarkInfo.name}
        />
      </div>

      <ItineraryForm
        duration={duration}
        setDuration={setDuration}
        interests={interests}
        setInterests={setInterests}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        landmarkName={landmarkInfo.name}
      />

      <GeneratedItineraryDisplay
        isLoading={isLoading}
        itinerary={itinerary}
        error={error}
      />
    </div>
  );
};

export default ItineraryGenerator;
