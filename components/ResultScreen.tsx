import React from 'react';
import ResultDisplay from './ResultDisplay';
import type { LandmarkInfo, AppUser } from '../types';

interface ResultScreenProps {
  user: AppUser | null;
  imageFile: File;
  imageUrl: string;
  landmarkInfo: LandmarkInfo;
  audioData?: string;
  onStartNewTour: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  user,
  imageFile,
  imageUrl,
  landmarkInfo,
  audioData,
  onStartNewTour
}) => {
  return (
    <>
      <ResultDisplay 
        user={user}
        imageFile={imageFile}
        imageUrl={imageUrl} 
        landmarkInfo={landmarkInfo} 
        audioData={audioData}
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
