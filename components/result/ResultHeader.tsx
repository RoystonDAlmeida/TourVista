import React from 'react';
import type { LandmarkInfo } from '../../types';

interface ResultHeaderProps {
    imageUrl?: string;
    landmarkInfo: LandmarkInfo;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ imageUrl, landmarkInfo }) => (
    <div className="relative w-full h-80 md:h-96">
        <img src={imageUrl} alt={landmarkInfo.name} className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
            <h2 className="text-3xl lg:text-5xl font-bold text-white drop-shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>{landmarkInfo.name}</h2>
        </div>
    </div>
);