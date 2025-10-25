import React, { useState } from 'react';
import type { LandmarkInfo, AppUser } from '../types';
import AudioPlayer from './AudioPlayer';
import ChatComponent from './Chat';
import NearbyPlaces from './NearbyPlaces';
import PostcardGenerator from './PostcardGenerator';
import ItineraryGenerator from './ItineraryGenerator';
import HistoricalTimeline from './HistoricalTimeline';
import SavedItinerariesAndDiscoveries from './SavedItinerariesAndDiscoveries';
import { BookOpenIcon, ChatBubbleLeftRightIcon, MapPinIcon, SparklesIcon, CalendarDaysIcon, HourglassIcon, BookmarkSquareIcon } from './icons';

interface ResultDisplayProps {
  user: AppUser | null;
  imageFile: File | null;
  imageUrl?: string;
  landmarkInfo: LandmarkInfo;
  audioData?: string;
}

type Tab = 'tour' | 'timeline' | 'chat' | 'nearby' | 'postcard' | 'itinerary' | 'trips';

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 justify-center px-4 py-3 font-semibold text-sm transition-all duration-200 ease-in-out focus:outline-none rounded-t-lg border-b-2
    ${
      isActive
        ? 'bg-slate-800 text-cyan-300 border-cyan-400'
        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border-transparent'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const TourGuideTab: React.FC<Pick<ResultDisplayProps, 'landmarkInfo' | 'audioData'>> = ({ landmarkInfo, audioData }) => (
    <div className="p-6">
        <p className="text-slate-300 leading-relaxed mb-6">{landmarkInfo.history}</p>
        <div className="space-y-6">

        {/* Conditionally render audioPlayer as saving of large audios is not possible */}
        { audioData && <AudioPlayer base64Audio={audioData} />}
        <div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Sources</h3>
            <ul className="space-y-1 text-sm">
            {landmarkInfo.sources.map((source, index) => (
                source.web?.uri && (
                <li key={index} className="truncate">
                    <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition"
                    >
                    {source.web.title || 'Web Source'}
                    </a>
                </li>
                )
            ))}
            </ul>
        </div>
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ user, imageUrl, landmarkInfo, audioData }) => {
  const [activeTab, setActiveTab] = useState<Tab>('tour');

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
      <div className="relative w-full h-80 md:h-96">

        {/* Conditionally render image as saving of images is not possible */}
        {imageUrl && <img src={imageUrl} alt={landmarkInfo.name} className="object-cover w-full h-full" />}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-white drop-shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>{landmarkInfo.name}</h2>
        </div>
      </div>
      
      <div className="flex flex-row bg-slate-800/60 border-b border-slate-700 overflow-x-auto px-2 sm:px-4">
          <TabButton label="Tour Guide" icon={<BookOpenIcon className="w-5 h-5"/>} isActive={activeTab === 'tour'} onClick={() => setActiveTab('tour')} />
          <TabButton label="Timeline" icon={<HourglassIcon className="w-5 h-5"/>} isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
          <TabButton label="Ask a Question" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <TabButton label="Nearby" icon={<MapPinIcon className="w-5 h-5"/>} isActive={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
          <TabButton label="Create Postcard" icon={<SparklesIcon className="w-5 h-5"/>} isActive={activeTab === 'postcard'} onClick={() => setActiveTab('postcard')} />
          <TabButton label="Itinerary" icon={<CalendarDaysIcon className="w-5 h-5"/>} isActive={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} />
          {user && <TabButton label="My Trips" icon={<BookmarkSquareIcon className="w-5 h-5"/>} isActive={activeTab === 'trips'} onClick={() => setActiveTab('trips')} />}
      </div>

      <div className="flex-grow bg-slate-800">
          {activeTab === 'tour' && <TourGuideTab landmarkInfo={landmarkInfo} audioData={audioData} />}
          {activeTab === 'timeline' && <HistoricalTimeline landmarkInfo={landmarkInfo} />}
          {activeTab === 'chat' && <ChatComponent landmarkInfo={landmarkInfo} />}
          {activeTab === 'nearby' && <NearbyPlaces landmarkInfo={landmarkInfo} />}
          {activeTab === 'postcard' && <PostcardGenerator imageUrl={imageUrl} />}
          {activeTab === 'itinerary' && user && <ItineraryGenerator user={user} landmarkInfo={landmarkInfo} />}
          {activeTab === 'trips' && user && <SavedItinerariesAndDiscoveries user={user} />}
      </div>
    </div>
  );
};

export default ResultDisplay;