import React from 'react';
import type { AppUser } from '../../types';
import { TabButton } from './TabButton';
import { BookOpenIcon, ChatBubbleLeftRightIcon, MapPinIcon, SparklesIcon, CalendarDaysIcon, HourglassIcon } from '../icons';

export type Tab = 'tour' | 'timeline' | 'chat' | 'nearby' | 'postcard' | 'itinerary' | 'trips';

interface ResultTabsProps {
    user: AppUser | null;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const ResultTabs: React.FC<ResultTabsProps> = ({ user, activeTab, setActiveTab }) => (
    <div className="flex flex-row bg-slate-800/60 border-b border-slate-700 overflow-x-auto px-2 sm:px-4">
        <TabButton label="Tour Guide" icon={<BookOpenIcon className="w-5 h-5"/>} isActive={activeTab === 'tour'} onClick={() => setActiveTab('tour')} />
        <TabButton label="Timeline" icon={<HourglassIcon className="w-5 h-5"/>} isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
        <TabButton label="Ask a Question" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <TabButton label="Nearby" icon={<MapPinIcon className="w-5 h-5"/>} isActive={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
        <TabButton label="Create Postcard" icon={<SparklesIcon className="w-5 h-5"/>} isActive={activeTab === 'postcard'} onClick={() => setActiveTab('postcard')} />
        <TabButton label="Itinerary" icon={<CalendarDaysIcon className="w-5 h-5"/>} isActive={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} />
    </div>
);