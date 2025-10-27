import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDiscoveriesForUser } from '../services/firebaseService';
import DiscoveryCard from './DiscoveryCard';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import type { AppUser, SavedDiscovery } from '../types';
import { useCache } from '../contexts/CacheContext';
import { handleDeleteDiscovery as deleteDiscoveryHandler } from '../utils/deleteUtils';
import ConfirmationDialog from './ConfirmationDialog';

interface MyDiscoveriesProps {
  user: AppUser | null;
}

const MyDiscoveries = ({ user }: MyDiscoveriesProps) => {
  const navigate = useNavigate();
  const { getDiscoveryList, cacheDiscoveryList } = useCache();
  const [discoveries, setDiscoveries] = useState<SavedDiscovery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscoveryConfirmOpen, setIsDiscoveryConfirmOpen] = useState(false);
  const [discoveryToDelete, setDiscoveryToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchDiscoveries = async () => {
      const cachedData = getDiscoveryList();
      // Check cache for discoveries data 
      if (cachedData) {
        setDiscoveries(cachedData);
        setIsLoading(false);
        return;
      }

      try {
        const userDiscoveries = await getDiscoveriesForUser(user.uid);
        const serializableDiscoveries = userDiscoveries.map(discovery => ({
          ...discovery,
          createdAt: discovery.createdAt.toString(),
        }));
        setDiscoveries(serializableDiscoveries);

        // Cache the user discoveries after fetching from DB
        cacheDiscoveryList(serializableDiscoveries);
      } catch (err) {
        setError('Failed to fetch discoveries.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoveries();
  }, [user, navigate, getDiscoveryList, cacheDiscoveryList]);

  const openDiscoveryDeleteDialog = (discoveryId: string) => {
    setDiscoveryToDelete(discoveryId);
    setIsDiscoveryConfirmOpen(true);
  };

  const confirmDeleteDiscovery = () => {
    if (!user || !discoveryToDelete) return;
    const onSuccess = () => {
      const updatedDiscoveries = discoveries.filter(d => d.id !== discoveryToDelete);
      setDiscoveries(updatedDiscoveries);
      cacheDiscoveryList(updatedDiscoveries.map(d => ({ ...d, createdAt: d.createdAt.toString() })));
      setIsDiscoveryConfirmOpen(false);
      setDiscoveryToDelete(null);
    };
    deleteDiscoveryHandler(user.uid, discoveryToDelete, onSuccess, setError);
  };

  if (isLoading) {
    return <Loader message="Loading your discoveries..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-100 mb-6">My Discoveries</h2>
      {discoveries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoveries.map((discovery) => {
            const discoveryWithDate = {
              ...discovery,
              createdAt: typeof discovery.createdAt === 'string' ? new Date(discovery.createdAt) : discovery.createdAt
            };
            return <DiscoveryCard key={discovery.id} discovery={discoveryWithDate} onDelete={(e) => { e.stopPropagation(); openDiscoveryDeleteDialog(discovery.id); }} />
          })}
        </div>
      ) : (
        <p className="text-slate-400">You haven't made any discoveries yet.</p>
      )}
      <ConfirmationDialog
        isOpen={isDiscoveryConfirmOpen}
        onClose={() => setIsDiscoveryConfirmOpen(false)}
        onConfirm={confirmDeleteDiscovery}
        title="Delete Discovery"
        message="Are you sure you want to delete this discovery? This action cannot be undone."
      />
    </div>
  );
};

export default MyDiscoveries;