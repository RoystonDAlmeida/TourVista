import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import ResultDisplay from './ResultDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import type { AppUser, LandmarkInfo, AudioData } from '../types';

interface DiscoveryDetailProps {
  user: AppUser | null;
}

const DiscoveryDetail = ({ user }: DiscoveryDetailProps) => {
  const { discoveryId } = useParams<{ discoveryId: string }>();
  const navigate = useNavigate();
  const [discovery, setDiscovery] = useState<{ landmarkInfo: LandmarkInfo; imageUrl: string; audioData: AudioData; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchDiscovery = async () => {
      if (!discoveryId) {
        setError('Discovery not found.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the discovery with user's id
        const docRef = doc(db, 'users', user.uid, 'discoveries', discoveryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const discoveryData = docSnap.data();
          setDiscovery(discoveryData as { landmarkInfo: LandmarkInfo; imageUrl: string; audioData: AudioData; });
        } else {
          setError('Discovery not found.');
        }
      } catch (err) {
        setError('Failed to fetch discovery.');
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchDiscovery();
  }, [discoveryId, user, navigate]);

  if (isLoading) {
    return <Loader message="Loading discovery..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!discovery) {
    return <ErrorDisplay error="Discovery not found." />;
  }

  return (
    <ResultDisplay
      user={user}
      imageFile={null}
      landmarkInfo={discovery.landmarkInfo}
    />
  );
};

export default DiscoveryDetail;