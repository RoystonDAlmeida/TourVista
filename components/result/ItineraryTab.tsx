import React from 'react';
import type { AppUser, LandmarkInfo } from '../../types';
import ItineraryGenerator from '../ItineraryGenerator';

interface ItineraryTabProps {
    user: AppUser | null;
    landmarkInfo: LandmarkInfo;
    discoveryId?: string;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ user, landmarkInfo, discoveryId }) => {
    if (!user) {
        return (
            <div className="p-6 text-center text-slate-400">
                Please sign in to generate an itinerary.
            </div>
        );
    }

    if (!discoveryId) {
        return (
            <div className="p-6 text-center text-slate-400">
                Discovery ID not available. Cannot generate itinerary.
            </div>
        );
    }

    return <ItineraryGenerator user={user} landmarkInfo = {landmarkInfo} discoveryId={discoveryId} />;
};