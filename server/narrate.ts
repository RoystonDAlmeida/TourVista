import { Router } from 'express';
import { Modality } from "@google/genai";
import { getAiClient, base64ToGenerativePart } from './utils/gemini';

const router = Router();

const { client: ai, error: aiError } = getAiClient();

router.post('/', async (req, res) =>  {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    try {
        const { text, voice, language } = req.body;
        if (!text || !voice || !language) {
            return res.status(400).json({ error: 'Missing required fields: text, voice, language' });
        }
        
        const prompt = `Narrate the following text clearly and enthusiastically: ${text}`;
        
        if (aiError) {
            return res.status(500).json({ error: aiError });
        }

        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        res.status(200).json({ audio: base64Audio });
    } catch (error) {
        console.error("Error in /api/narrate:", error);
        res.status(500).json({ error: 'Failed to generate narration.' });
    }
});

export default router;