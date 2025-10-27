import React, { useState, useEffect, useCallback } from 'react';
import { getPostcardsForUser, auth } from '../services/firebaseService';
import { Postcard } from '../types';
import Loader from './Loader';
import { DownloadIcon, ShareIcon, TrashIcon } from './icons';
import ConfirmationDialog from './ConfirmationDialog';
import { handleDeletePostcard } from '../utils/deleteUtils';

interface GeneratedPostcardsDisplayProps {
  discoveryId?: string;
}

const GeneratedPostcardsDisplay: React.FC<GeneratedPostcardsDisplayProps> = ({ discoveryId }) => {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postcardToDelete, setPostcardToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>("");

  const fetchPostcards = useCallback(async () => {
    if (auth.currentUser) {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPostcards = await getPostcardsForUser(auth.currentUser.uid, discoveryId);
        setPostcards(fetchedPostcards);
      } catch (err: any) {
        console.error("Error fetching postcards:", err);
        setError(err.message || "Failed to load your postcards.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setPostcards([]);
      setIsLoading(false);
    }
  }, [discoveryId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchPostcards();
      } else {
        setPostcards([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchPostcards]);

  const handleDeleteClick = (postcardId: string) => {
    setPostcardToDelete(postcardId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (postcardToDelete && auth.currentUser) {
      await handleDeletePostcard(
        auth.currentUser.uid,
        postcardToDelete,
        () => {
          setPostcards(postcards.filter(p => p.id !== postcardToDelete));
          setNotification('Postcard deleted successfully.');
          setShowDeleteConfirm(false);
          setPostcardToDelete(null);
        },
        (errorMessage) => {
          setError(errorMessage);
          setShowDeleteConfirm(false);
        }
      );
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'postcard.png', { type: blob.type });
        await navigator.share({
          title: 'My TourVista Postcard',
          text: `Check out this postcard I made with TourVista!`,
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert("Failed to share postcard. Please try again.");
      }
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'tourvista-postcard.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex justify-center items-center h-48">
        <Loader message="Loading your postcards..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-red-300 text-center">
        {error}
      </div>
    );
  }

  if (postcards.length === 0) {
    return (
      <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-slate-500 text-center">
        You haven't generated any postcards yet. Create one above!
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Generated Postcards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {postcards.map((postcard) => (
          <div key={postcard.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg relative group">
            <img 
              src={postcard.imageUrl} 
              alt={`Postcard: ${postcard.stylePrompt}`} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-3">
              <p className="text-sm text-slate-300 font-semibold truncate">{postcard.stylePrompt}</p>
              {postcard.createdAt && (
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(postcard.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => handleDownload(postcard.imageUrl)}
                className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                title="Download Postcard"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare(postcard.imageUrl)}
                className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                title="Share Postcard"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDeleteClick(postcard.id)}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Delete Postcard"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Postcard"
        message="Are you sure you want to delete this postcard? This action cannot be undone."
      />
    </div>
  );
};

export default GeneratedPostcardsDisplay;
