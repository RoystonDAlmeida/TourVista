import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    confirmPasswordReset,
    type User
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    deleteDoc,
    query,
    orderBy,
    where,
    limit,
    updateDoc,
    onSnapshot
} from 'firebase/firestore';
import type { AppUser, SavedItinerary, SavedDiscovery, ChatMessage, Conversation, NearbyPlace, Postcard } from '../types';

// Create firebase config object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- User Profile Management ---
export const createUserDocumentFromAuth = async (userAuth: User, additionalInfo = {}) => {
    if (!userAuth) return;
    const userDocRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        const { displayName, email, photoURL } = userAuth;
        const createdAt = new Date();
        try {
            await setDoc(userDocRef, {
                displayName,
                email,
                photoURL,
                createdAt,
                ...additionalInfo,
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
    return userDocRef;
}

// --- Authentication ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    await createUserDocumentFromAuth(user);
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await createUserDocumentFromAuth(user, { displayName });
    await sendEmailVerification(user);
};

export const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const sendPasswordResetEmail = async (email: string) => {
    return firebaseSendPasswordResetEmail(auth, email);
};
  
export const resetPassword = (oobCode: string, newPassword: string) => {
    return confirmPasswordReset(auth, oobCode, newPassword);
};

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (callback: (user: AppUser | null) => void) => 
    onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
            const { uid, displayName, email, photoURL, emailVerified } = user;
            callback({ uid, displayName, email, photoURL, emailVerified });
        } else {
            callback(null);
        }
    });

// --- Firestore Itinerary Management ---
export const saveItineraryForUser = async (userId: string, itineraryData: Omit<SavedItinerary, 'id' | 'createdAt'>) => {
    const itinerariesCollectionRef = collection(db, 'users', userId, 'itineraries');
    await addDoc(itinerariesCollectionRef, {
        ...itineraryData,
        createdAt: serverTimestamp(),
    });
};

export const getItinerariesForUser = async (userId: string): Promise<SavedItinerary[]> => {
    const itinerariesCollectionRef = collection(db, 'users', userId, 'itineraries');
    const q = query(itinerariesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            landmarkName: data.landmarkName,
            duration: data.duration,
            interests: data.interests,
            itineraryContent: data.itineraryContent,
            createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JS Date
        } as SavedItinerary;
    });
};

export const deleteItineraryForUser = async (userId: string, itineraryId: string) => {
    const itineraryDocRef = doc(db, 'users', userId, 'itineraries', itineraryId);
    await deleteDoc(itineraryDocRef);
};

// Saving discoveries for users in firebase
export const saveDiscoveryForUser = async (userId: string, discoveryData: object): Promise<string> => {
    const discoveriesCollectionRef = collection(db, 'users', userId, 'discoveries');
    const docRef = await addDoc(discoveriesCollectionRef, {
        ...discoveryData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const savePostcardForUser = async (userId: string, postcardData: { imageUrl: string; stylePrompt: string; originalImageUrl?: string; discoveryId?: string; }): Promise<string> => {
    const postcardsCollectionRef = collection(db, 'users', userId, 'postcards');
    const docRef = await addDoc(postcardsCollectionRef, {
        ...postcardData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const saveNearbyPlaceForUser = async (userId: string, nearbyPlaceData: Omit<NearbyPlace, 'id' | 'createdAt'>): Promise<string> => {
    const nearbyPlacesCollectionRef = collection(db, 'users', userId, 'nearbyPlaces');
    const docRef = await addDoc(nearbyPlacesCollectionRef, {
        ...nearbyPlaceData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getNearbyPlacesForUser = async (userId: string): Promise<NearbyPlace[]> => {
    const nearbyPlacesCollectionRef = collection(db, 'users', userId, 'nearbyPlaces');
    const q = query(nearbyPlacesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            createdAt: data.createdAt.toDate(),
            description: data.description,
            name: data.name,
            title: data.title,
            uri: data.uri,
        } as NearbyPlace;
    });
};

export const getDiscoveriesForUser = async (userId: string): Promise<SavedDiscovery[]> => {
    const discoveriesCollectionRef = collection(db, 'users', userId, 'discoveries');
    const q = query(discoveriesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            landmarkInfo: data.landmarkInfo,
            languages: data.languages,
            imageUrl: data.imageUrl, // Add this line
            createdAt: data.createdAt.toDate(),
        } as SavedDiscovery;
    });
};

export const getPostcardsForUser = async (userId: string, discoveryId?: string): Promise<Postcard[]> => {
    const postcardsCollectionRef = collection(db, 'users', userId, 'postcards');
    let q = query(postcardsCollectionRef, orderBy('createdAt', 'desc'));

    if (discoveryId) {
        q = query(q, where('discoveryId', '==', discoveryId));
    }
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            imageUrl: data.imageUrl,
            stylePrompt: data.stylePrompt,
            originalImageUrl: data.originalImageUrl,
            createdAt: data.createdAt.toDate(),
        } as Postcard;
    });
};

export const deleteDiscoveryForUser = async (userId: string, discoveryId: string) => {
    const discoveryDocRef = doc(db, 'users', userId, 'discoveries', discoveryId);
    await deleteDoc(discoveryDocRef);
};

export const getDiscovery = async (userId: string, discoveryId: string): Promise<SavedDiscovery | null> => {
    const discoveryDocRef = doc(db, 'users', userId, 'discoveries', discoveryId);
    const docSnapshot = await getDoc(discoveryDocRef);

    if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            landmarkInfo: data.landmarkInfo,
            languages: data.languages,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt.toDate(),
            timeline: data.timeline, // This field may be undefined, which is fine
        } as SavedDiscovery;
    }
    return null;
};

export const updateDiscoveryWithTimeline = async (userId: string, discoveryId: string, timeline: string) => {
    const discoveryDocRef = doc(db, 'users', userId, 'discoveries', discoveryId);
    await updateDoc(discoveryDocRef, {
        timeline: timeline,
    });
};

// --- Firestore Chat Management ---

export const getOrCreateConversation = async (userId: string, discoveryId: string): Promise<Conversation> => {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    const q = query(conversationsRef, where('discoveryId', '==', discoveryId), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            userId: data.userId,
            discoveryId: data.discoveryId,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as Conversation;
    } else {
        // Create a new conversation document with an empty history array.
        // This provides a stable ID for the frontend listener.
        const newConversationRef = doc(collection(db, 'users', userId, 'conversations'));
        await setDoc(newConversationRef, {
            userId,
            discoveryId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            history: [], // Initialize history
        });
        
        // Fetch the newly created doc to get its data and server-generated timestamps
        const newDoc = await getDoc(newConversationRef);
        const data = newDoc.data()!;

        return {
            id: newDoc.id,
            userId: data.userId,
            discoveryId: data.discoveryId,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as Conversation;
    }
};

/**
 * Listens to a conversation document and provides the message history array.
 * @param userId The user's ID.
 * @param conversationId The ID of the conversation document.
 * @param callback The callback to be invoked with the array of messages.
 * @returns An unsubscribe function for the listener.
 */
export const listenToConversationMessages = (
    userId: string,
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
): (() => void) => {
    // Listen to the single conversation document, not the sub-collection
    const conversationDocRef = doc(db, 'users', userId, 'conversations', conversationId);

    return onSnapshot(conversationDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const conversationData = docSnapshot.data();
            // The messages are now in the 'history' array field
            const history = conversationData.history || [];

            const messages: ChatMessage[] = history.map((msg: any, index: number) => ({
                role: msg.role,
                text: msg.text,
                timestamp: msg.timestamp?.toDate(),
                // Create a stable key using the index, as array items don't have unique IDs
                key: `${docSnapshot.id}-${index}`,
            }));
            callback(messages);
        } else {
            // If the document doesn't exist, return an empty array
            callback([]);
        }
    });
};

export { auth, db };