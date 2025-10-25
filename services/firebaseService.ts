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
} from 'firebase/firestore';
import type { AppUser, SavedItinerary, SavedDiscovery } from '../types';

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
const app = initializeApp(firebaseConfig);
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
export const saveDiscoveryForUser = async (userId: string, discoveryData: object) => {
    const discoveriesCollectionRef = collection(db, 'users', userId, 'discoveries');
    await addDoc(discoveriesCollectionRef, {
        ...discoveryData,
        createdAt: serverTimestamp(),
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

export const deleteDiscoveryForUser = async (userId: string, discoveryId: string) => {
    const discoveryDocRef = doc(db, 'users', userId, 'discoveries', discoveryId);
    await deleteDoc(discoveryDocRef);
};
export { auth, db };