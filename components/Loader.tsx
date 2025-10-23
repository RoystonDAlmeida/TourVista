
import React from 'react';
import { MapPinIcon } from './icons';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-slate-800/50 rounded-lg">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute w-full h-full bg-cyan-400/30 rounded-full animate-ping"></div>
        <MapPinIcon className="relative w-10 h-10 text-cyan-300"/>
      </div>
      <p className="text-lg text-cyan-200 font-medium">{message}</p>
    </div>
  );
};

export default Loader;
