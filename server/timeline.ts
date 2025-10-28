import { Router } from 'express';
import { getAiClient } from './utils/gemini';
import { z } from 'zod';
import { validate } from './utils/validation';

const router = Router();

const timelineSchema = z.object({
    body: z.object({
        landmarkInfo: z.object({
            name: z.string().min(1, "landmarkInfo.name is required"),
            history: z.string().min(1, "landmarkInfo.history is required"),
        }).passthrough(),
    }),
});

const { client: ai, error: aiError } = getAiClient();

router.post('/', validate(timelineSchema), async (req, res) => {
    try {
        const { landmarkInfo } = req.body;

        const prompt = `Act as a historian and storyteller. Create a detailed historical timeline for ${landmarkInfo.name}.
                        Focus on key dates, significant events, and interesting, little-known facts.
                        Present it as an engaging narrative or a clear, chronological timeline.
                        The context for the landmark is: ${landmarkInfo.history}.

                        Please structure the response in Markdown format. Use headings for different eras or centuries, and bullet points for specific events with dates. For example:

                        ### 18th Century
                        *   **1750:** Construction began under the commission of...
                        *   **1765:** A significant fire halted construction...

                        Ensure the information is accurate, engaging, and provides deep historical context.`;
        
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        res.status(200).json({ timeline: response.text });
    } catch (error) {
        console.error("Error in /api/timeline:", error);
        res.status(500).json({ error: 'Failed to generate timeline.' });
    }
});

export default router;