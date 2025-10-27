import { Link } from 'react-router-dom';
import type { SavedDiscovery } from '../types';
import { TrashIcon } from './icons';

const DiscoveryCard: React.FC<{ discovery: SavedDiscovery, onDelete: (e: React.MouseEvent) => void }> = ({ discovery, onDelete }) => (
  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors duration-300 shadow-lg flex flex-col justify-between h-full">
    <Link to={`/discoveries/${discovery.id}`} className="block w-full">
      <div>
        {discovery.imageUrl && (
          <img src={discovery.imageUrl} alt={discovery.landmarkInfo.name} className="w-full h-32 object-cover rounded-md mb-4" />
        )}
        <h3 className="font-bold text-lg text-cyan-300 truncate">{discovery.landmarkInfo.name}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-3">
          {discovery.landmarkInfo.history}
        </p>
        <p className="text-xs text-slate-500">
          Discovered on: {discovery.createdAt.toLocaleString()}
        </p>
      </div>
    </Link>
    <button onClick={(e) => onDelete(e)} className="text-red-400 hover:text-red-300 transition-colors self-end mt-4">
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
);

export default DiscoveryCard;
