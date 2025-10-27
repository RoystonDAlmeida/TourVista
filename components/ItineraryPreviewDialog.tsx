import React from 'react';
import { InteractiveItinerary } from './InteractiveItinerary';
import { SavedItinerary } from '../types';

interface ItineraryPreviewDialogProps {
  itinerary: SavedItinerary;
  onClose: () => void;
}

const ItineraryPreviewDialog: React.FC<ItineraryPreviewDialogProps> = ({
  itinerary,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-300">Itinerary Preview</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow custom-scrollbar">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Duration: {itinerary.duration}</h3>
          <p className="text-slate-300 mb-4">Interests: {itinerary.interests}</p>
          <InteractiveItinerary markdownText={itinerary.itineraryContent} />
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPreviewDialog;