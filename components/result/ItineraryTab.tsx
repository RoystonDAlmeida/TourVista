import React from 'react';
import type { AppUser, LandmarkInfo } from '../../types';
import ItineraryGenerator from '../ItineraryGenerator';

interface ItineraryTabProps {
    user: AppUser | null;
    landmarkInfo: LandmarkInfo;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ user, landmarkInfo }) => {
    if (!user) {
        return (
            <div className="p-6 text-center text-slate-400">
                Please sign in to generate an itinerary.
            </div>
        );
    }

    return <ItineraryGenerator user={user} landmarkInfo={landmarkInfo} />;
};