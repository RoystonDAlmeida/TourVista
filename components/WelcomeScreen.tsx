import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="text-center p-10 bg-slate-800/50 rounded-2xl max-w-2xl w-full shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-cyan-300">Your AI-Powered Travel Companion</h2>
      <p className="mt-2 text-slate-400 mb-8">
        Unlock a world of discovery. Sign in to turn your photos into interactive tours, 
        create personalized itineraries, and save all your travel adventures.
      </p>
      <button
        onClick={onGetStarted}
        className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors shadow-lg text-lg transform hover:scale-105"
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomeScreen;
