import { deleteItineraryForUser, deleteDiscoveryForUser, deletePostcardForUser } from '../services/firebaseService';

export const handleDeleteItinerary = async (
    userId: string,
    itineraryId: string,
    onSuccess: () => void,
    onError: (message: string) => void
) => {
    try {
        await deleteItineraryForUser(userId, itineraryId);
        onSuccess();
    } catch (err) {
        console.error(err);
        onError('Failed to delete itinerary.');
    }
};

export const handleDeleteDiscovery = async (
    userId: string,
    discoveryId: string,
    onSuccess: () => void,
    onError: (message: string) => void
) => {
    try {
        await deleteDiscoveryForUser(userId, discoveryId);
        onSuccess();
    } catch (err) {
        console.error(err);
        onError('Failed to delete discovery.');
    }
};

export const handleDeletePostcard = async (
    userId: string,
    postcardId: string,
    onSuccess: () => void,
    onError: (message: string) => void
) => {
    try {
        await deletePostcardForUser(userId, postcardId);
        onSuccess();
    } catch (err) {
        console.error(err);
        onError('Failed to delete postcard.');
    }
};