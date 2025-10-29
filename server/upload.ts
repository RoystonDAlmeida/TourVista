import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { z } from 'zod';
import { validate } from './utils/validation';

interface ImgBBErrorResponse {
  error: {
    message: string;
    code: number;
  };
}

interface ImgBBSuccessResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

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
    // req.file is guaranteed to exist by multer and validate(uploadSchema)
    formData.append('image', req.file!.buffer.toString('base64'));

    const response = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ImgBBErrorResponse;
      console.error('ImgBB upload failed:', errorData);
      return res.status(response.status).json({ error: errorData.error.message || 'Failed to upload image to ImgBB' });
    }

    const data = (await response.json()) as ImgBBSuccessResponse;
    if (data.success) {
      res.status(200).json({ url: data.data.url });
    } else {
      // If response.ok is true but data.success is false, it's still an error from ImgBB
      const errorData = data as unknown as ImgBBErrorResponse; // Cast to unknown first to allow re-casting
      console.error('ImgBB upload failed:', errorData.error);
      res.status(500).json({ error: errorData.error.message || 'ImgBB upload failed' });
    }
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    let errorMessage = 'Internal server error during image upload.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default uploadRouter;
