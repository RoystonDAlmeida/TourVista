import { Router } from 'express';
import { getAiClient } from './utils/gemini';
import { z } from 'zod';
import { validate } from './utils/validation';

const router = Router();

const itinerarySchema = z.object({
    body: z.object({
        landmarkInfo: z.object({
            name: z.string().min(1, "landmarkInfo.name is required"),
            history: z.string().min(1, "landmarkInfo.history is required"),
        }).passthrough(), // Allow other properties on landmarkInfo
        duration: z.string().min(1, "duration is required"),
        interests: z.string().min(1, "interests is required"),
    }),
});

const { client: ai, error: aiError } = getAiClient();

router.post('/', validate(itinerarySchema), async (req, res) => {
    if (aiError) {
        return res.status(500).json({ error: aiError });
    }

    try {
        const { landmarkInfo, duration, interests } = req.body;
        const prompt = `Act as an expert travel planner. Create a personalized travel itinerary starting at ${landmarkInfo.name}.
                        The user wants an itinerary for: ${duration}.
                        Their interests are: ${interests}.
                        The location is ${landmarkInfo.name}, which has the following context: ${landmarkInfo.history}.

                        Please provide a detailed, engaging, and practical itinerary. Structure the response in Markdown format, using headings for days or times, bullet points for activities, and bold text for important places or tips. Be creative and suggest specific restaurants, attractions, and activities that align with the user's interests.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        
        res.status(200).json({ itinerary: response.text });
    } catch (error) {
        console.error("Error in /api/itinerary:", error);
        res.status(500).json({ error: 'Failed to generate itinerary.' });
    }
});

export default router;