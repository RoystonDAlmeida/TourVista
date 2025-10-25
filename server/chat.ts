import { Router } from 'express';
import { getAiClient } from './utils/gemini';

const router = Router();

const { client: ai, error: aiError } = getAiClient();

router.post('/', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (aiError) {
        console.error("AI Client Initialization Error:", aiError);
        return res.status(500).json({ error: aiError });
    }

    try {
        const { history, message, landmarkInfo } = req.body;
        if (!history || !message || !landmarkInfo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful and knowledgeable tour guide chatbot. The user is currently interested in ${landmarkInfo.name}. Your task is to answer their questions about this landmark. Use the following context, but you can also draw upon your general knowledge. Context: ${landmarkInfo.history}`,
            },
            history: history.map((msg: {role: 'user' | 'model', text: string}) => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }))
        });

        const stream = await chat.sendMessageStream({ message });
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of stream) {
            res.write(chunk.text);
        }
        res.end();

    } catch (error) {
        console.error("Error in /api/chat:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process chat request.' });
        } else {
            res.end();
        }
    }
});

export default router;
