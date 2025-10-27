import type { SavedItinerary } from '../types';
import { TrashIcon } from './icons.js';

const ItineraryCard: React.FC<{ itinerary: SavedItinerary, landmarkName: string, onDelete: (e: React.MouseEvent) => void, onClick?: () => void }> = ({ itinerary, landmarkName, onDelete, onClick }) => (
    <div
      className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors duration-300 shadow-lg flex flex-col justify-between"
    >
      <div onClick={onClick} className="cursor-pointer flex-grow">
        <h3 className="font-bold text-lg text-cyan-300 truncate">{landmarkName}</h3>
        <p className="text-sm text-slate-400 mb-3">
          {itinerary.duration} - <span className="italic">{itinerary.interests}</span>
        </p>
        <p className="text-xs text-slate-500">
          Created on: {itinerary.createdAt.toLocaleDateString()}
        </p>
      </div>
      <button onClick={(e) => onDelete(e)} className="text-red-400 hover:text-red-300 transition-colors self-end mt-4">
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
);

export default ItineraryCard;