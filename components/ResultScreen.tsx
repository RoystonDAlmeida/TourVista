import React, { useEffect } from 'react';
import ResultDisplay from './ResultDisplay';
import type { LandmarkInfo, AppUser } from '../types';

interface ResultScreenProps {
  user: AppUser | null;
  imageFile: File;
  imageUrl: string;
  landmarkInfo: LandmarkInfo;
  audioData?: string;
  discoveryId: string;
  onStartNewTour: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  user,
  imageFile,
  imageUrl,
  landmarkInfo,
  audioData,
  discoveryId,
  onStartNewTour
}) => {
  useEffect(() => {
    if (landmarkInfo?.name) {
      document.title = `${landmarkInfo.name} - TourVista`;
    } else {
      document.title = 'Discovery Result - TourVista';
    }
  }, [landmarkInfo]);
  return (
    <>
      <ResultDisplay 
        user={user}
        imageFile={imageFile}
        imageUrl={imageUrl} 
        landmarkInfo={landmarkInfo} 
        audioData={audioData}
        discoveryId={discoveryId}
      />
      <button
        onClick={onStartNewTour}
        className="mt-8 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 transition-colors rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Start New Tour
      </button>
    </>
  );
};

export default ResultScreen;
