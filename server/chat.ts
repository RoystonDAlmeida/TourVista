import { Router } from 'express';
import { getAiClient } from './utils/gemini';
import * as admin from 'firebase-admin'; // Import firebase-admin
import { FieldValue } from 'firebase-admin/firestore'; // Import FieldValue for serverTimestamp
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    let serviceAccount: any;

    // Try to get service account from environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            console.log('Using Firebase credentials from FIREBASE_SERVICE_ACCOUNT_KEY env variable');
        } catch (error) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
            process.exit(1);
        }
    } 

    // Initialize Firebase Admin here!
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore(); // Get Firestore instance from admin SDK

const router = Router();

const { client: ai, error: aiError } = getAiClient();

// Helper function to get landmarkInfo from discoveryId
async function getLandmarkInfoFromDiscoveryId(userId: string, discoveryId: string): Promise<any | null> {
    try {
        const discoveryDoc = await db.collection('users').doc(userId).collection('discoveries').doc(discoveryId).get();
        if (discoveryDoc.exists) {
            return discoveryDoc.data()?.landmarkInfo;
        }
        return null;
    } catch (error) {
        console.error("Error fetching landmarkInfo:", error);
        return null;
    }
}

router.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (aiError) {
        console.error("AI Client Initialization Error:", aiError);
        return res.status(500).json({ error: aiError });
    }

    try {
        const { userId, discoveryId, message } = req.body;
        if (!userId || !discoveryId || !message) {
            return res.status(400).json({ error: 'Missing required fields: userId, discoveryId, or message' });
        }

        // 1. Get or Create Conversation reference
        const conversationsRef = db.collection('users').doc(userId).collection('conversations');
        const existingConversations = await conversationsRef.where('discoveryId', '==', discoveryId).limit(1).get();

        let conversationRef;
        if (!existingConversations.empty) {
            conversationRef = existingConversations.docs[0].ref;
        } else {
            conversationRef = conversationsRef.doc();
            await conversationRef.set({
                userId,
                discoveryId,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                history: [],
            });
        }

        // 2. Add user message and AI placeholder to history atomically
        const userMessage = {
            role: 'user',
            text: message,
            timestamp: new Date(),
        };
        
        // Add a placeholder for the AI's response to give instant feedback
        const aiPlaceholder = {
            role: 'model',
            text: '...', // Placeholder text to indicate typing
            timestamp: new Date(),
        };
        await conversationRef.update({
            history: FieldValue.arrayUnion(userMessage, aiPlaceholder),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // 3. Respond to the client immediately
        res.status(202).json({ message: 'Message received and is being processed.' });

        // --- BACKGROUND PROCESSING ---

        // 4. Fetch Landmark Info
        const landmarkInfo = await getLandmarkInfoFromDiscoveryId(userId, discoveryId);
        if (!landmarkInfo) {
            const errorMessage = { role: 'model', text: "Sorry, I couldn't retrieve landmark info.", timestamp: new Date() };
            const currentDoc = await conversationRef.get();
            const currentHistory = currentDoc.data()?.history || [];
            currentHistory.pop(); // Remove placeholder
            currentHistory.push(errorMessage); // Add error message
            await conversationRef.update({ history: currentHistory });
            return;
        }

        // 5. Prepare AI History (excluding the placeholder)
        const conversationSnapshot = await conversationRef.get();
        const currentHistory = conversationSnapshot.data()?.history || [];
        const historyForAI = currentHistory
            .slice(0, -1) // Exclude our placeholder from the history sent to the AI
            .map((msg: any) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));

        // 6. Call Gemini
        const chat = ai!.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful tour guide chatbot for ${landmarkInfo.name}. Context: ${landmarkInfo.history}`,
            },
            history: historyForAI as any,
        });

        const result = await chat.sendMessage({ message });
        const fullAiResponse = result.text;

        // 7. Replace the placeholder with the final AI response
        const finalModelMessage = {
            role: 'model',
            text: fullAiResponse,
            timestamp: new Date(),
        };

        // To replace the placeholder, we must read, modify, and write the entire array.
        const finalHistory = (await conversationRef.get()).data()?.history || [];
        if (finalHistory.length > 0) {
            finalHistory[finalHistory.length - 1] = finalModelMessage; // Replace last element
        }

        await conversationRef.update({
            history: finalHistory,
            updatedAt: FieldValue.serverTimestamp(),
        });

    } catch (error) {
        console.error("Error in /api/chat:", error);
    }
});

export default router;
