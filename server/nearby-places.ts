import { Router } from 'express';
import { GenerateContentResponse } from "@google/genai";
import { getAiClient } from './utils/gemini';

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri: string;
        title: string;
        text: string;
      }[];
    }[];
  };
}

const router = Router();

const { client: ai, error: aiError } = getAiClient();

router.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let geminiResponse: GenerateContentResponse;
    try {
        const { landmarkName, coords } = req.body;
        if (!landmarkName || !coords) {
            return res.status(400).json({ error: 'Missing landmarkName or coords' });
        }

        if (aiError) {
          return res.status(500).json({ error: aiError });
        }
        
        const prompt = `List and briefly describe 3-4 interesting places near ${landmarkName}, such as highly-rated restaurants, museums, or other attractions. For each place, provide a concise, engaging description of about 2 lines. Respond with ONLY a valid JSON array in the following format:
                        [
                          {"name": "Place Name", "description": "A concise, engaging two-line description of the place."},
                          {"name": "Another Place Name", "description": "Another concise, engaging two-line description."}
                        ]`;

        geminiResponse = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    }
                  }
                }
              },
        });

        let jsonText = geminiResponse.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
    
        const placesFromText = JSON.parse(jsonText);
        const sources = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.maps) as GroundingChunk[] ?? [];
        
        res.status(200).json({ placesFromText, sources });
    } catch (error) {
        console.error("Error in /api/nearby-places:", error);
         if (error instanceof SyntaxError) {
             console.error("Failed to parse JSON response from AI:", geminiResponse!.text);
             return res.status(500).json({ error: "The AI returned an invalid response format for nearby places." });
        }
        res.status(500).json({ error: 'Failed to fetch nearby places.' });
    }
});

export default router;