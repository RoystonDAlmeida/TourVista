import React from 'react';

const ITINERARY_DURATIONS = ['Half Day', 'Full Day', '2 Days'];

interface ItineraryFormProps {
  duration: string;
  setDuration: (duration: string) => void;
  interests: string;
  setInterests: (interests: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  landmarkName: string;
}

const ItineraryForm: React.FC<ItineraryFormProps> = ({
  duration,
  setDuration,
  interests,
  setInterests,
  isLoading,
  onSubmit,
  landmarkName,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Duration */}
        <div className="flex-1">
          <label htmlFor="duration-select" className="block text-sm font-medium text-slate-300 mb-1">Duration</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={isLoading}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            {ITINERARY_DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {/* Interests */}
        <div className="flex-[2]">
          <label htmlFor="interests-input" className="block text-sm font-medium text-slate-300 mb-1">Interests</label>
          <input
            id="interests-input"
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., art, history, local food"
            className="bg-slate-700 border border-slate-600 rounded-lg p-2.5 w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm"
            disabled={isLoading}
          />
        </div>
      </div>
      <button type="submit" disabled={isLoading || !interests.trim()} className="w-full px-4 py-2.5 bg-cyan-600 text-white rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 transition font-semibold">
        {isLoading ? 'Crafting & Saving Plan...' : 'Generate Itinerary'}
      </button>
    </form>
  );
};

export default ItineraryForm;
