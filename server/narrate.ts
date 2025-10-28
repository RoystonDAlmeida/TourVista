import { Router } from 'express';
import { Modality } from "@google/genai";
import { getAiClient, base64ToGenerativePart } from './utils/gemini';
import { z } from 'zod';
import { validate } from './utils/validation';

const router = Router();

const narrateSchema = z.object({
    body: z.object({
        text: z.string().min(1, "text is required"),
        voice: z.string().min(1, "voice is required"),
        language: z.string().min(1, "language is required"),
    }),
});

const { client: ai, error: aiError } = getAiClient();

router.post('/', validate(narrateSchema), async (req, res) =>  {
    try {
        const { text, voice, language } = req.body;
        
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