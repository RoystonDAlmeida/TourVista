import React, { useState, useEffect } from 'react';
import { getPostcardsForUser, auth } from '../services/firebaseService';
import { Postcard } from '../types';
import Loader from './Loader';

interface GeneratedPostcardsDisplayProps {
  discoveryId?: string;
}

const GeneratedPostcardsDisplay: React.FC<GeneratedPostcardsDisplayProps> = ({ discoveryId }) => {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostcards = async () => {
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
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchPostcards();
      } else {
        setPostcards([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
        You haven't generated any postcards yet. Create one below!
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">Your Generated Postcards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {postcards.map((postcard) => (
          <div key={postcard.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedPostcardsDisplay;