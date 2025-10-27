import React from 'react';
import Loader from './Loader';
import { InteractiveItinerary } from './InteractiveItinerary'; // Assuming InteractiveItinerary is also modularized

interface GeneratedItineraryDisplayProps {
  isLoading: boolean;
  itinerary: string | null;
  error: string | null;
}

const GeneratedItineraryDisplay: React.FC<GeneratedItineraryDisplayProps> = ({
  isLoading,
  itinerary,
  error,
}) => {
  return (
    <div className="mt-6">
      {isLoading && <Loader message="Building your personalized itinerary..." />}
      {error && <div className="text-red-300 mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">{error}</div>}
      {itinerary && !isLoading && (
        <div className="bg-slate-900/50 p-4 sm:p-6 rounded-xl border border-slate-700 text-slate-300 leading-relaxed">
           <InteractiveItinerary markdownText={itinerary} />
        </div>
      )}
    </div>
  );
};

export default GeneratedItineraryDisplay;
