import React, { useEffect } from 'react';
import ImageUploader from './ImageUploader';
import SavedItinerariesAndDiscoveries from './SavedItinerariesAndDiscoveries';
import type { AppUser } from '../types';

interface UserDashboardProps {
  user: AppUser;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onImageUpload, isLoading }) => {
  useEffect(() => {
    document.title = 'Dashboard - TourVista';
  }, []);
  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">
          Welcome back, {user.displayName?.split(' ')[0] || 'Explorer'}!
        </h2>
        <p className="text-slate-400 mt-1">Ready for your next adventure?</p>
      </div>
      <SavedItinerariesAndDiscoveries user={user} />
      <div className="mt-12">
        <ImageUploader onImageUpload={onImageUpload} disabled={isLoading} />
      </div>
    </div>
  );
};

export default UserDashboard;
