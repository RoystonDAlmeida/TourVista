import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { z } from 'zod';
import { validate } from './utils/validation';

const uploadRouter = Router();
const upload = multer();

const uploadSchema = z.object({
    file: z.any().refine(file => !!file, { message: "No image file provided." }),
});

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
const IMGBB_API_URL = process.env.IMGBB_API_URL;

uploadRouter.post('/image', upload.single('image'), validate(uploadSchema), async (req, res) => {
  try {

    if (!IMGBB_API_KEY) {
      console.error('IMGBB_API_KEY is not defined in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: Image upload API key missing.' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));

    const response = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ImgBB upload failed:', errorData);
      return res.status(response.status).json({ error: errorData.error.message || 'Failed to upload image to ImgBB' });
    }

    const data = await response.json();
    if (data.success) {
      res.status(200).json({ url: data.data.url });
    } else {
      console.error('ImgBB upload failed:', data.error);
      res.status(500).json({ error: data.error.message || 'ImgBB upload failed' });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Internal server error during image upload.' });
  }
});

export default uploadRouter;
