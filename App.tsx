import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import Settings from './components/Settings';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import UserDashboard from './components/UserDashboard';
import Footer from './components/Footer';
import AuthModal from './components/auth/AuthModal';
import DiscoveryDetail from './components/DiscoveryDetail';
import MyDiscoveries from './components/MyDiscoveries';
import MyItineraries from './components/MyItineraries';

import { useLandmarkProcessing } from './hooks/useLandmarkProcessing';
import { onAuthStateChangedListener } from './services/firebaseService';
import type { AppUser } from './types';

import { CacheProvider } from './contexts/CacheContext';
import DiscoveryNavigator from './components/DiscoveryNavigator';

// New component to encapsulate logic dependent on CacheProvider
const AppContent = ({ currentUser, isAuthLoading, isAuthModalOpen, setIsAuthModalOpen }: {
  currentUser: AppUser | null;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isDiscoveryRoute = location.pathname.startsWith('/discoveries/') && location.pathname.split('/').length === 3;

  const [showSettings, setShowSettings] = useState(false);
  const [hasSettingsBeenShown, setHasSettingsBeenShown] = useState(false);

  const { 
    imageFile,
    landmarkInfo,
    audioData,
    isLoading,
    loadingMessage,
    error,
    selectedLanguage,
    availableLanguages,
    selectedVoice,
    handleImageUpload,
    handleLanguageChange,
    handleVoiceChange, // New action
    resetState,
    isGeneratingNarration // New state
  } = useLandmarkProcessing(navigate);

  useEffect(() => {
    if (landmarkInfo && location.pathname === '/' && !hasSettingsBeenShown) {
      setShowSettings(true);
      setHasSettingsBeenShown(true);
    } else if (!landmarkInfo) {
      // Reset hasSettingsBeenShown when landmarkInfo is cleared
      setHasSettingsBeenShown(false);
    }
  }, [landmarkInfo, location.pathname, hasSettingsBeenShown]);

  const handleStartNewTour = () => {
    resetState();
    setShowSettings(false); // Reset showSettings when starting a new tour
    setHasSettingsBeenShown(false); // Reset hasSettingsBeenShown
    navigate('/');
  };

  useEffect(() => {
    if (['/signin', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)) {
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [location.pathname]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} />;
    }

    if (currentUser && location.pathname === '/') {
      // Fetch the user dashboard with saved itineraries and discoveries
      return (
        <UserDashboard
          user={currentUser}
          onImageUpload={handleImageUpload}
          isLoading={isLoading}
        />
      );
    }

    return (
      <WelcomeScreen onGetStarted={() => navigate('/signup')} />
    );
  }

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader message="Loading TourVista..." /></div>;
  }

  return (
    <DiscoveryNavigator>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header 
        user={currentUser} 
        onSignInClick={() => navigate('/signin')}
      >
        {showSettings && (
          <Settings 
            availableLanguages={availableLanguages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange} // Use new handler
            disabled={isLoading || !imageFile || isGeneratingNarration} // Disable if generating narration
          />
        )}
      </Header>

      <main className="relative w-full flex-grow flex flex-col items-center justify-center"> {/* Added relative positioning */}
        {isGeneratingNarration && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/75 z-20 rounded-lg"> {/* Increased z-index */}
            <p className="text-white text-lg font-semibold">Generating narration...</p>
          </div>
        )}
        <ErrorDisplay error={error} />
        <Routes>
          <Route path="/discoveries" element={<MyDiscoveries user={currentUser} />} />
          <Route path="/itineraries" element={<MyItineraries user={currentUser} />} />
          <Route path="/discoveries/:discoveryId" element={<DiscoveryDetail user={currentUser} onStartNewTour={handleStartNewTour} audioData={isDiscoveryRoute ? audioData : null} selectedLanguage={selectedLanguage} />} />
          <Route path="/*" element={renderContent()} />
        </Routes>
      </main>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          navigate('/');
        }}
      />
      <Footer />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f8fafc',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  </DiscoveryNavigator>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <CacheProvider>
      <AppContent 
        currentUser={currentUser}
        isAuthLoading={isAuthLoading}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />
    </CacheProvider>
  );
}

export default App;