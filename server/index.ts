import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';

// Import routers
import chatRouter from './chat';
import itineraryRouter from './itinerary';
import landmarkInfoRouter from './landmark-info';
import languagesRouter from './languages';
import narrateRouter from './narrate';
import uploadRouter from './upload';
import nearbyPlacesRouter from './nearby-places';

import postcardRouter from './postcard';
import timelineRouter from './timeline';

// Load environment variables
dotenv.config();

// Access PORT env varible
const PORT = process.env.PORT || 3000;

// Initialize the express app
const app = express();

// Configure CORS options
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',  // Only allow your frontend URL
    credentials: true,                       // Allow cookies/auth headers if needed
    optionsSuccessStatus: 200                
};

app.use((req, res, next) => {
    if (req.headers.expect === '100-continue') {
      res.writeContinue(); // tell curl to go ahead
    }
    next();
  });

app.use(helmet()); // Secure HTTP headers

// Middleware
app.use(morgan('dev')); // Add http request logger
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increase limit for images
app.use(xss()); // Sanitize against XSS attacks

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use('/api', limiter);

// Health check route
app.get('/api', (req, res) => {
    res.status(200).send('TourVista Backend is running with Express!');
});

// Use routers
app.use('/api/chat', chatRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/landmark-info', landmarkInfoRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/narrate', narrateRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/nearby-places', nearbyPlacesRouter);

app.use('/api/postcard', postcardRouter);
app.use('/api/timeline', timelineRouter);

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT:${PORT}`);
})