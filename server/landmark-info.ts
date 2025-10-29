import { Router } from 'express';
import { GenerateContentResponse } from "@google/genai";
import { getAiClient, base64ToGenerativePart } from './utils/gemini';
import { z } from 'zod';
import { validate } from './utils/validation';

const router = Router();

const landmarkInfoSchema = z.object({
    body: z.object({
        image: z.string().min(1, "image is required"),
        mimeType: z.string().min(1, "mimeType is required"),
        language: z.string().min(1, "language is required"),
    }),
});

const { client: ai, error: aiError } = getAiClient();

router.post('/', validate(landmarkInfoSchema), async (req, res) => {
    let geminiResponse: GenerateContentResponse | undefined;
    try {
        const { image, mimeType, language } = req.body;

        if (aiError) {
            return res.status(500).json({ error: aiError });
        }

        const imagePart = base64ToGenerativePart(image, mimeType);
        const prompt = `Follow these steps carefully:
                        1. Identify the landmark in the photo.
                        2. Find a concise and engaging history of this landmark (under 200 words).
                        3. **Crucially, translate this history into fluent ${language}.**
                        4. Provide the landmark's official name and its precise latitude and longitude.
                        5. **Crucially, find the 2-letter country code.**
                        Finally, respond with ONLY a valid JSON object containing the translated history and other details. The JSON structure must be:
                        {
                        "name": "Landmark Name",
                        "history": "History translated into ${language}...",
                        "latitude": 12.345,
                        "longitude": -67.890,
                        "countryCode": "Country Code"
        }`;
        
        geminiResponse = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: { tools: [{ googleSearch: {} }] },
        });

        const responseText = geminiResponse.text?.trim() || '';
        if (!responseText) {
            console.error("Gemini response is missing text field. Full response:", JSON.stringify(geminiResponse, null, 2));
            if (geminiResponse?.promptFeedback?.blockReason) {
                return res.status(500).json({ error: `Request was blocked. Reason: ${geminiResponse.promptFeedback.blockReason}` });
            }
            return res.status(500).json({ error: "The AI returned an empty response. This could be due to content filtering or a temporary issue. Please try a different image." });
        }

        const jsonStartIndex = responseText.indexOf('{');
        const jsonEndIndex = responseText.lastIndexOf('}');

        if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
             console.error("Failed to find JSON object in AI response:", responseText);
             return res.status(500).json({ error: "The AI returned an invalid response format. Could not find a JSON object." });
        }
        
        const jsonText = responseText.substring(jsonStartIndex, jsonEndIndex + 1);

        const info = JSON.parse(jsonText);
        const sources = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

        res.status(200).json({ ...info, sources });
    } catch (error: any) {
        console.error("Error in /api/landmark-info:", error);
        if (error instanceof SyntaxError) {
             console.error("Failed to parse JSON response from AI:", geminiResponse?.text);
             return res.status(500).json({ error: "The AI returned an invalid response format. Please try again." });
        }
        res.status(500).json({ error: error.message || 'Failed to process landmark information.' });
    }
});

export default router;