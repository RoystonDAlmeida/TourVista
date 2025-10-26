import React, { useState, useEffect, useRef } from 'react';
import { generateTimeline } from '../services/geminiService';
import { getDiscovery, updateDiscoveryWithTimeline } from '../services/firebaseService';
import { useCache } from '../contexts/CacheContext';
import type { LandmarkInfo, AppUser } from '../types';
import Loader from './Loader';

// TimelineRenderer component remains the same as before
const TimelineRenderer: React.FC<{ markdownText: string }> = ({ markdownText }) => {
    const lines = markdownText.split('\n').filter(line => line.trim() !== '');
    const elements: React.ReactNode[] = [];
    let currentEra: React.ReactNode = null;
    let eventsInEra: string[] = [];

    const flushEra = () => {
        if (currentEra && eventsInEra.length > 0) {
            elements.push(
                <div key={elements.length} className="timeline-item">
                    <div className="timeline-content bg-slate-700/50 p-4 rounded-lg">
                        {currentEra}
                        <ul className="mt-2 space-y-2 text-sm text-slate-300 list-disc list-inside">
                            {eventsInEra.map((event, index) => {
                                const htmlContent = event.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>');
                                return <li key={index} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                            })}
                        </ul>
                    </div>
                </div>
            );
        }
        eventsInEra = [];
    };

    lines.forEach(line => {
        if (line.startsWith('### ')) {
            flushEra();
            currentEra = <h3 className="text-xl font-bold text-cyan-300">{line.substring(4)}</h3>;
        } else if (line.startsWith('* ')) {
            eventsInEra.push(line);
        } else { // Handle paragraphs as descriptions within an era
             eventsInEra.push(`* ${line}`);
        }
    });

    flushEra();

    return <div className="timeline">{elements}</div>;
};


interface HistoricalTimelineProps {
  landmarkInfo: LandmarkInfo;
  user: AppUser | null;
  discoveryId: string;
}

const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ landmarkInfo, user, discoveryId }) => {
  const [timeline, setTimeline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTimeline, cacheTimeline } = useCache();
  const isFetching = useRef(false); // Ref to prevent double API calls

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!user || !discoveryId) {
        try {
            const result = await generateTimeline(landmarkInfo);
            setTimeline(result);
        } catch (err: any) {
            setError(err.message || "An error occurred while generating the timeline.");
        } finally {
            setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      // 1. Check session cache
      const cachedTimeline = getTimeline(discoveryId);
      if (cachedTimeline) {
        setTimeline(cachedTimeline);
        setIsLoading(false);
        return;
      }

      // 2. Check Firestore
      try {
        const discoveryDoc = await getDiscovery(user.uid, discoveryId);
        if (discoveryDoc?.timeline) {
          cacheTimeline(discoveryId, discoveryDoc.timeline);
          setTimeline(discoveryDoc.timeline);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error fetching discovery from Firestore:", err);
      }

      // 3. Generate new timeline, save, and cache
      if (isFetching.current) {
        return; // Exit if a fetch is already in progress
      }

      try {
        isFetching.current = true; // Set the flag before the API call
        const newTimeline = await generateTimeline(landmarkInfo);
        setTimeline(newTimeline);
        cacheTimeline(discoveryId, newTimeline);
        updateDiscoveryWithTimeline(user.uid, discoveryId, newTimeline).catch(err => {
            console.error("Failed to save timeline to Firestore:", err);
        });
      } catch (err: any) {
        setError(err.message || "An error occurred while generating the timeline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [landmarkInfo, user, discoveryId, getTimeline, cacheTimeline]);

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-b-lg min-h-[30rem]">
      <h3 className="text-2xl font-bold text-cyan-300 mb-6">Historical Timeline & Stories</h3>
      {isLoading && <div className="flex justify-center items-center h-full"><Loader message="Uncovering historical secrets..." /></div>}
      {error && <div className="text-red-300 p-3 bg-red-900/50 border border-red-700 rounded-lg">{error}</div>}
      
      {timeline && !isLoading && (
        <div className="text-slate-300 leading-relaxed">
            <TimelineRenderer markdownText={timeline} />
        </div>
      )}
    </div>
  );
};

export default HistoricalTimeline;
