import React, { useState, useEffect } from 'react';
import { getItinerariesForUser, getDiscoveriesForUser } from '../services/firebaseService.js';
import type { AppUser } from '../types.js';
import { BookmarkSquareIcon, CameraIcon } from './icons.js';
import ItineraryCard from './ItineraryCard.js';
import DiscoveryCard from './DiscoveryCard.js';
import type { SavedItinerary, SavedDiscovery } from '../types';
import { useCache } from '../contexts/CacheContext.js';
import { handleDeleteItinerary as deleteItineraryHandler, handleDeleteDiscovery as deleteDiscoveryHandler } from '../utils/deleteUtils.js';
import ConfirmationDialog from './ConfirmationDialog.js';
import ItineraryPreviewDialog from './ItineraryPreviewDialog.js';

const LoadingSkeleton = () => (
  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg animate-pulse">
    <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
  </div>
);

const SavedItinerariesAndDiscoveries: React.FC<{ user: AppUser }> = ({ user }) => {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [discoveries, setDiscoveries] = useState<SavedDiscovery[]>([]);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(true);
  const [isLoadingDiscoveries, setIsLoadingDiscoveries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cacheDiscovery, cacheDiscoveryList, getDiscoveryList, getCachedItineraries, cacheItineraries, clearItineraryCache } = useCache();

  // State for delete confirmations
  const [isItineraryConfirmOpen, setIsItineraryConfirmOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null);
  const [isDiscoveryConfirmOpen, setIsDiscoveryConfirmOpen] = useState(false);
  const [discoveryToDelete, setDiscoveryToDelete] = useState<string | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);


  useEffect(() => {
    const fetchItineraries = async () => {
      const cachedData = getCachedItineraries();
      if (cachedData) {
        setItineraries(cachedData);
        setIsLoadingItineraries(false);
        return;
      }
      try {
        setIsLoadingItineraries(true);
        const userItineraries = await getItinerariesForUser(user.uid);
        const serializableItineraries = userItineraries.map(itinerary => ({
          ...itinerary,
          createdAt: itinerary.createdAt.toString(),
        }));
        setItineraries(userItineraries);
        cacheItineraries(serializableItineraries);
      } catch (err) {
        console.error("Error fetching itineraries:", err);
        setError("Could not load your saved trips. Please try again later.");
      } finally {
        setIsLoadingItineraries(false);
      }
    };

    const fetchDiscoveries = async () => {
      const cachedList = getDiscoveryList();
      if (cachedList) {
        setDiscoveries(cachedList);
        setIsLoadingDiscoveries(false);
        return;
      }
      try {
        if (!cachedList) {
          setIsLoadingDiscoveries(true);
        }
        const userDiscoveries = await getDiscoveriesForUser(user.uid);
        const serializableDiscoveries = userDiscoveries.map(discovery => ({
          ...discovery,
          createdAt: discovery.createdAt.toString(),
        }));
        setDiscoveries(userDiscoveries);
        cacheDiscoveryList(serializableDiscoveries);
        
      } catch (err) {
        console.error("Error fetching discoveries:", err);
        setError("Could not load your saved discoveries. Please try again later.");
      } finally {
        setIsLoadingDiscoveries(false);
      }
    };

    fetchItineraries();
    fetchDiscoveries();
  }, [user.uid, cacheDiscovery, cacheDiscoveryList, getDiscoveryList, getCachedItineraries, cacheItineraries]);

  // Itinerary Delete Logic
  const openItineraryDeleteDialog = (itineraryId: string) => {
    setItineraryToDelete(itineraryId);
    setIsItineraryConfirmOpen(true);
  };

  const confirmItineraryDelete = () => {
    if (itineraryToDelete) {
      const onSuccess = () => {
        setItineraries(prev => prev.filter(item => item.id !== itineraryToDelete));
        clearItineraryCache();
        setIsItineraryConfirmOpen(false);
        setItineraryToDelete(null);
        setShowPreviewDialog(false); // Close preview if open
        setSelectedItinerary(null); // Clear selected itinerary
      };
      deleteItineraryHandler(user.uid, itineraryToDelete, onSuccess, (message) => setError(message));
    }
  };

  // Discovery Delete Logic
  const openDiscoveryDeleteDialog = (discoveryId: string) => {
    setDiscoveryToDelete(discoveryId);
    setIsDiscoveryConfirmOpen(true);
  };

  const confirmDiscoveryDelete = () => {
    if (discoveryToDelete) {
      const onSuccess = () => {
          const updatedDiscoveries = discoveries.filter(d => d.id !== discoveryToDelete);
          setDiscoveries(updatedDiscoveries);
          cacheDiscoveryList(updatedDiscoveries.map(d => ({ ...d, createdAt: d.createdAt.toString() })));
          setIsDiscoveryConfirmOpen(false);
          setDiscoveryToDelete(null);
      };
      deleteDiscoveryHandler(user.uid, discoveryToDelete, onSuccess, (message) => setError(message));
    }
  };

  const handleCardClick = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
    setShowPreviewDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedItinerary(null);
    setShowPreviewDialog(false);
  };

  const handleDeleteRequest = () => {
    if (selectedItinerary) {
      openItineraryDeleteDialog(selectedItinerary.id);
    }
  };


  if (error) {
    return <div className="text-red-300 text-center p-4">{error}</div>;
  }

  return (
    <div className="w-full space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-4">
            <CameraIcon className="w-7 h-7 text-cyan-400" />
            <h2 className="text-2xl font-bold text-slate-200">My Discoveries</h2>
        </div>
        {isLoadingDiscoveries ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        ) : discoveries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveries.map((discovery) => {
              const discoveryWithDate = {
                ...discovery,
                createdAt: typeof discovery.createdAt === 'string' ? new Date(discovery.createdAt) : discovery.createdAt
              };
              return <DiscoveryCard key={discovery.id} discovery={discoveryWithDate} onDelete={(e) => { e.stopPropagation(); openDiscoveryDeleteDialog(discovery.id); }} />
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
            <p className="text-slate-400">You haven't made any discoveries yet.</p>
            <p className="text-slate-500 text-sm mt-1">Upload a photo of a landmark to add a discovery!</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
            <BookmarkSquareIcon className="w-7 h-7 text-cyan-400" />
            <h2 className="text-2xl font-bold text-slate-200">My Trips</h2>
        </div>
        {isLoadingItineraries ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        ) : itineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itineraries.map((itinerary) => {
              const itineraryWithDate = {
                ...itinerary,
                createdAt: typeof itinerary.createdAt === 'string' ? new Date(itinerary.createdAt) : itinerary.createdAt
              };
              return <ItineraryCard key={itinerary.id} itinerary={itineraryWithDate} landmarkName={itinerary.landmarkName} onClick={() => handleCardClick(itinerary)} onDelete={(e) => { e.stopPropagation(); openItineraryDeleteDialog(itinerary.id); }} />
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
            <p className="text-slate-400">You haven't created any itineraries yet.</p>
            <p className="text-slate-500 text-sm mt-1">Upload a photo of a landmark to get started!</p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isItineraryConfirmOpen}
        onClose={() => setIsItineraryConfirmOpen(false)}
        onConfirm={confirmItineraryDelete}
        title="Delete Itinerary"
        message="Are you sure you want to delete this itinerary? This action cannot be undone."
      />

      <ConfirmationDialog
        isOpen={isDiscoveryConfirmOpen}
        onClose={() => setIsDiscoveryConfirmOpen(false)}
        onConfirm={confirmDiscoveryDelete}
        title="Delete Discovery"
        message="Are you sure you want to delete this discovery? This action cannot be undone."
      />
      {selectedItinerary && (
        <ItineraryPreviewDialog
          isOpen={showPreviewDialog}
          itinerary={selectedItinerary}
          onClose={handleCloseDialog}
          onDelete={handleDeleteRequest}
        />
      )}
    </div>
  );
};

export default SavedItinerariesAndDiscoveries;
