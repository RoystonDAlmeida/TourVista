import React, { useState } from 'react';
import type { LandmarkInfo, AppUser } from '../types';

// Import the new modular components
import { ResultHeader } from './result/ResultHeader';
import { ResultTabs, Tab } from './result/ResultTabs';
import { TourGuideTab } from './result/TourGuideTab';
import { ChatTab } from './result/ChatTab';
import { ItineraryTab } from './result/ItineraryTab';

// Import the components for the other tabs
import NearbyPlaces from './NearbyPlaces';
import PostcardGenerator from './PostcardGenerator';
import HistoricalTimeline from './HistoricalTimeline';
import SavedItinerariesAndDiscoveries from './SavedItinerariesAndDiscoveries';

interface ResultDisplayProps {
  user: AppUser | null;
  imageFile: File | null;
  imageUrl?: string;
  landmarkInfo: LandmarkInfo;
  audioData?: string;
  discoveryId: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ user, imageUrl, landmarkInfo, audioData, discoveryId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('tour');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tour':
        return <TourGuideTab landmarkInfo={landmarkInfo} audioData={audioData} />;
      case 'timeline':
        return <HistoricalTimeline landmarkInfo={landmarkInfo} />;
      case 'chat':
        return <ChatTab user={user} discoveryId={discoveryId} />;
      case 'nearby':
        return <NearbyPlaces landmarkInfo={landmarkInfo} />;
      case 'postcard':
        return <PostcardGenerator imageUrl={imageUrl} />;
      case 'itinerary':
        return <ItineraryTab user={user} landmarkInfo={landmarkInfo} />;
      case 'trips':
        return user ? <SavedItinerariesAndDiscoveries user={user} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
      <ResultHeader imageUrl={imageUrl} landmarkInfo={landmarkInfo} />
      <ResultTabs user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow bg-slate-800">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResultDisplay;