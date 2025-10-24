import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export function getAiClient(): { client: GoogleGenAI | null; error: string | null } {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        const errorMessage = "API_KEY environment variable is not set. Please create a .env.local file with API_KEY='your_key' for local development.";
        return { client: null, error: errorMessage };
    }
    return { client: new GoogleGenAI({ apiKey: API_KEY }), error: null };
}


// Helper for image parts
export const base64ToGenerativePart = (data: string, mimeType: string) => ({
    inlineData: { data, mimeType },
});