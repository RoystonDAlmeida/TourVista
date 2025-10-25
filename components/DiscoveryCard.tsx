import { Link } from 'react-router-dom';
import type { SavedDiscovery } from '../types';

const DiscoveryCard: React.FC<{ discovery: SavedDiscovery }> = ({ discovery }) => (
  <Link to={`/discoveries/${discovery.id}`} className="block w-full">
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-colors duration-300 shadow-lg flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-lg text-cyan-300 truncate">{discovery.landmarkInfo.name}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-3">
          {discovery.landmarkInfo.history}
        </p>
        <p className="text-xs text-slate-500">
          Discovered on: {discovery.createdAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  </Link>
);

export default DiscoveryCard;