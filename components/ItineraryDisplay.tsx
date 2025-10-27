import React, { useState, useEffect, useCallback } from 'react';
import { getItinerariesForDiscovery } from '../services/firebaseService';
import { SavedItinerary } from '../types';
import Loader from './Loader';
import ItineraryCard from './ItineraryCard';
import ItineraryPreviewDialog from './ItineraryPreviewDialog';
import { handleDeleteItinerary } from '../utils/deleteUtils';
import { useCache } from '../contexts/CacheContext';
import ConfirmationDialog from './ConfirmationDialog';

interface ItineraryDisplayProps {
  userId: string;
  discoveryId: string;
  landmarkName: string;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ userId, discoveryId, landmarkName }) => {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<string>("");

  const { cacheItineraries, getCachedItineraries, clearItineraryCache } = useCache();

  const fetchItineraries = useCallback(async () => {
    if (!userId || !discoveryId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const cached = getCachedItineraries();
      if (cached && cached.some(it => it.discoveryId === discoveryId)) {
        setItineraries(cached.filter(it => it.discoveryId === discoveryId));
        setIsLoading(false);
        return;
      }
      const fetchedItineraries = await getItinerariesForDiscovery(userId, discoveryId);
      setItineraries(fetchedItineraries);
      cacheItineraries(fetchedItineraries);
    } catch (err: any) {
      console.error("Error fetching itineraries:", err);
      setError(err.message || "Failed to load itineraries.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, discoveryId, cacheItineraries, getCachedItineraries]);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const handleCardClick = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
    setShowPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setShowPreviewDialog(false);
    setSelectedItinerary(null);
  };

  const handleDeleteRequest = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary); // Set which itinerary to delete
    setShowDeleteConfirm(true);     // Open confirmation dialog
  };

  const confirmDeleteItinerary = async () => {
    if (selectedItinerary) {
      await handleDeleteItinerary(
        userId,
        selectedItinerary.id,
        () => {
          setItineraries(prev => prev.filter(it => it.id !== selectedItinerary.id));
          setNotification('Itinerary deleted successfully.');
          clearItineraryCache();
          setShowDeleteConfirm(false);
          // If the preview for the deleted item was open, close it
          if (showPreviewDialog) {
            handleClosePreview();
          }
          setSelectedItinerary(null); // Clear selection
        },
        (errorMessage) => {
          setError(errorMessage);
          setShowDeleteConfirm(false);
        }
      );
    }
  };

  if (isLoading) {
    return <Loader message="Loading itineraries..." />;
  }

  if (error) {
    return <div className="text-red-300 text-center">Error: {error}</div>;
  }

  if (itineraries.length === 0) {
    return <p className="text-slate-400">No itineraries generated for this discovery yet.</p>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Itineraries for this Discovery</h3>
      {notification && <p className="text-green-400 mb-4">{notification}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itineraries.map(itinerary => (
          <ItineraryCard
            key={itinerary.id}
            itinerary={itinerary}
            landmarkName={landmarkName}
            onClick={() => handleCardClick(itinerary)}
            onDelete={(e) => { e.stopPropagation(); handleDeleteRequest(itinerary); }}
          />
        ))}
      </div>

      {selectedItinerary && <ItineraryPreviewDialog
        isOpen={showPreviewDialog}
        onClose={handleClosePreview}
        itinerary={selectedItinerary}
        onDelete={() => handleDeleteRequest(selectedItinerary)}
      />}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteItinerary}
        title="Delete Itinerary"
        message="Are you sure you want to delete this itinerary? This action cannot be undone."
      />
    </div>
  );
};

export default ItineraryDisplay;