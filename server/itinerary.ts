import { Router } from 'express';
import { getAiClient } from './utils/gemini';

const router = Router();

const { client: ai, error: aiError } = getAiClient();

router.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (aiError) {
        return res.status(500).json({ error: aiError });
    }

    try {
        const { landmarkInfo, duration, interests } = req.body;
        if (!landmarkInfo || !duration || !interests) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
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