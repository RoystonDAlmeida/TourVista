import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItinerariesForUser } from '../services/firebaseService';
import ItineraryCard from './ItineraryCard';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import type { AppUser, SavedItinerary } from '../types';
import { useCache } from '../contexts/CacheContext';
import { handleDeleteItinerary as deleteItineraryHandler } from '../utils/deleteUtils';
import ConfirmationDialog from './ConfirmationDialog';
import ItineraryPreviewDialog from './ItineraryPreviewDialog';

interface MyItinerariesProps {
  user: AppUser | null;
}

const MyItineraries = ({ user }: MyItinerariesProps) => {
  const navigate = useNavigate();
  const { getCachedItineraries, cacheItineraries, clearItineraryCache } = useCache();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchItineraries = async () => {
      const cachedData = getCachedItineraries();
      if (cachedData) {
        setItineraries(cachedData);
        setIsLoading(false);
        return;
      }

      try {
        const userItineraries = await getItinerariesForUser(user.uid);
        const serializableItineraries = userItineraries.map(itinerary => ({
          ...itinerary,
          createdAt: itinerary.createdAt.toString(),
        }));
        setItineraries(userItineraries);
        cacheItineraries(serializableItineraries);
      } catch (err) {
        setError('Failed to fetch itineraries.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [user, navigate, getCachedItineraries, cacheItineraries]);

  const openDeleteDialog = (itineraryId: string) => {
    setSelectedItineraryId(itineraryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!user || !selectedItineraryId) return;

    const onSuccess = () => {
      setItineraries(itineraries.filter(i => i.id !== selectedItineraryId));
      clearItineraryCache();
      setIsDeleteDialogOpen(false);
      setSelectedItineraryId(null);
    };

    deleteItineraryHandler(user.uid, selectedItineraryId, onSuccess, setError);
  };

  const handleCardClick = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleCloseDialog = () => {
    setSelectedItinerary(null);
  };


  if (isLoading) {
    return <Loader message="Loading your itineraries..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-100 mb-6">My Itineraries</h2>
      {itineraries.length > 0 ? (
        <div className="space-y-4">
          {itineraries.map((itinerary) => {
            const itineraryWithDate = {
              ...itinerary,
              createdAt: typeof itinerary.createdAt === 'string' ? new Date(itinerary.createdAt) : itinerary.createdAt
            };
            return <ItineraryCard key={itinerary.id} itinerary={itineraryWithDate} landmarkName={itinerary.landmarkName} onClick={() => handleCardClick(itinerary)} onDelete={(e) => { e.stopPropagation(); openDeleteDialog(itinerary.id); }} />
          })}
        </div>
      ) : (
        <p className="text-slate-400">You haven't created any itineraries yet.</p>
      )}
       <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Itinerary"
        message="Are you sure you want to delete this itinerary? This action cannot be undone."
      />
      {selectedItinerary && (
        <ItineraryPreviewDialog
          itinerary={selectedItinerary}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default MyItineraries;
