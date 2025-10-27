import React from 'react';
import type { NearbyPlace } from '../../types';
import { MapPinIcon, ExternalLinkIcon } from '../icons';

export const PlaceCard: React.FC<{ place: NearbyPlace; onShowOnMap: (name: string, latitude: number, longitude: number) => void; }> = ({ place, onShowOnMap }) => (
    <div className="relative flex-shrink-0 w-64 sm:w-72 bg-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-lg h-full overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
            <h4 className="font-bold text-cyan-300 truncate" title={place.name}>{place.name}</h4>
            <p className="text-slate-300 text-sm mt-1 mb-3 h-20 overflow-y-auto text-ellipsis">{place.description}</p>
        </div>
        <div className="relative z-10 mt-auto flex flex-col sm:flex-row gap-2">
            <button 
                onClick={() => onShowOnMap(place.name, place.latitude, place.longitude)}
                className="flex-1 text-sm font-semibold bg-slate-600 hover:bg-slate-500 transition-colors text-white py-2 px-3 rounded-md flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-700"
            >
                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Show on Map</span>
            </button>
            <a 
                href={place.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 transition-colors text-white py-2 px-3 rounded-md flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-700"
            >
                <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Directions</span>
            </a>
        </div>
    </div>
);