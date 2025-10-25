import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import Settings from './components/Settings';
import Header from './components/Header';
import ErrorDisplay from './components/ErrorDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import UserDashboard from './components/UserDashboard';
import ResultScreen from './components/ResultScreen';
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

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    imageFile,
    imageUrl,
    landmarkInfo,
    audioData,
    isLoading,
    loadingMessage,
    error,
    selectedLanguage,
    availableLanguages,
    selectedVoice,
    setSelectedVoice,
    handleImageUpload,
    handleLanguageChange,
    resetState,
    discoveryId // Get discoveryId from the hook
  } = useLandmarkProcessing();

  const handleStartNewTour = () => {
    resetState();
    navigate('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

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

    // If we have landmarkInfo and are not currently navigating to a discovery page,
    // we should not render ResultScreen here, as navigation will handle it.
    // The ResultScreen will be rendered by the /discoveries/:discoveryId route.
    if (landmarkInfo && imageUrl && imageFile && audioData && !discoveryId) {
      return (
        <ResultScreen
          user={currentUser}
          imageFile={imageFile}
          imageUrl={imageUrl}
          landmarkInfo={landmarkInfo}
          audioData={audioData}
          onStartNewTour={handleStartNewTour}
          discoveryId={discoveryId!}
        />
      );
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
    <CacheProvider>
      <DiscoveryNavigator>
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
        <Header 
          user={currentUser} 
          onSignInClick={() => navigate('/signin')}
        >
          {landmarkInfo && (
            <Settings 
              availableLanguages={availableLanguages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              disabled={isLoading || !imageFile}
            />
          )}
        </Header>

        <main className="w-full flex-grow flex flex-col items-center justify-center">
          <ErrorDisplay error={error} />
          <Routes>
            <Route path="/discoveries" element={<MyDiscoveries user={currentUser} />} />
            <Route path="/itineraries" element={<MyItineraries user={currentUser} />} />
            <Route path="/discoveries/:discoveryId" element={<DiscoveryDetail user={currentUser} onStartNewTour={handleStartNewTour} />} />
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
    </CacheProvider>
  );
}

export default App;