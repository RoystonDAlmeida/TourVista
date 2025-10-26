import React from 'react';
import type { LandmarkInfo } from '../../types';
import { ExternalLinkIcon } from '../icons';
import AudioPlayer from '../AudioPlayer';

interface TourGuideTabProps {
    landmarkInfo: LandmarkInfo;
    audioData?: string;
}

export const TourGuideTab: React.FC<TourGuideTabProps> = ({ landmarkInfo, audioData }) => (
    <div className="p-6">
        <p className="text-slate-300 leading-relaxed mb-6">{landmarkInfo.history}</p>
        <div className="space-y-6">

        {/* Conditionally render audioPlayer as saving of large audios is not possible */}
        { audioData && <AudioPlayer base64Audio={audioData} />}
        <div>
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landmarkInfo.sources.map((source, index) => (
                source.web?.uri && (
                <div key={index} className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-1 text-base">{source.web.title || 'Web Source'}</h4>
                    </div>
                    <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition flex items-center gap-1 text-sm mt-2"
                    >
                    {source.web.uri.length > 30 ? `${source.web.uri.substring(0, 27)}...` : source.web.uri}
                    <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                </div>
                )
            ))}
            </div>
        </div>
        </div>
    </div>
);