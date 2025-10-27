import { Router } from 'express';
import { Modality } from "@google/genai";
import { getAiClient, base64ToGenerativePart } from './utils/gemini';

const router = Router();

const { client: ai, error: aiError } = getAiClient();

router.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    try {
        const { image, mimeType, stylePrompt } = req.body;
        if (!image || !mimeType || !stylePrompt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (aiError) {
            return res.status(500).json({ error: aiError });
        }

        const imagePart = base64ToGenerativePart(image, mimeType);
        const response = await ai!.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: {
                parts: [
                    imagePart,
                    { text: `Recreate this image in the style of: ${stylePrompt}. The result should be visually appealing, like a digital postcard.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[1];
        if (part?.inlineData?.data) {
            res.status(200).json({ image: part.inlineData.data });
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error in /api/postcard:", error);
        res.status(500).json({ error: 'Failed to generate postcard.' });
    }
});

export default router;