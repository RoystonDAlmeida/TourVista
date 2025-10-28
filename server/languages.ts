import { Router } from 'express';
import dotenv from 'dotenv';
import { Type } from "@google/genai";
import { getAiClient } from './utils/gemini';
import { z } from 'zod';
import { validate } from './utils/validation';

// Load environment variables
dotenv.config();

const router = Router();

const languagesSchema = z.object({
    body: z.object({
        countryCode: z.string().min(1, "countryCode is required"),
    }),
});

const { client: ai, error: aiError } = getAiClient();

router.post('/', validate(languagesSchema), async (req, res) =>{
    try {
        const { countryCode } = req.body;

        const COUNTRY_LANGUAGES_API_KEY = process.env.COUNTRY_LANGUAGES_API_KEY;

        const COUNTRY_LANGUAGES_API_URL = process.env.COUNTRY_LANGUAGES_API_URL;
        if(!COUNTRY_LANGUAGES_API_KEY && !COUNTRY_LANGUAGES_API_URL)
        {
            const errorMessage = "COUNTRY_LANGUAGES_API_KEY environment variable is not set. Please create a .env.local file with COUNTRY_LANGUAGES_API_KEY='your_key' for local development.";
            return res.status(500).json({ error: errorMessage });
        }

        let official_languages_list: string[] = [];

        try {
            // Make a GET request to the Country Languages API
            const api_response = await fetch(`${COUNTRY_LANGUAGES_API_URL}?name=${countryCode}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'x-api-key': COUNTRY_LANGUAGES_API_KEY
                } as HeadersInit
            });

            const api_response_json = await api_response.json();

            // Get the official languages of the country code
            official_languages_list = api_response_json?.data?.officialLanguages ?? [];
        } catch (error) {
            console.error("Error in /api/languages:", error);
            res.status(500).json({ error: `Failed to fetch official languages of country with code ${countryCode}` });
        }

        const prompt = `Consider the following list of official languages: ${JSON.stringify(official_languages_list)}. Respond with ONLY a valid JSON array of objects, where each object has "code" (the language name in English, e.g., "Spanish") and "name" (the language name in its own script, e.g., "Español"). Example: [{"code": "French", "name": "Français"}]`;
        
        if (aiError) {
            return res.status(500).json({ error: aiError });
        }

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            code: { type: Type.STRING },
                            name: { type: Type.STRING },
                        },
                        required: ["code", "name"],
                    },
                },
            },
        });

        res.status(200).json(JSON.parse(response.text));
    } catch (error) {
        console.error("Error in /api/languages:", error);
        res.status(500).json({ error: 'Failed to fetch languages.' });
    }
});

export default router;