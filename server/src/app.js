import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import authRouter from './routes/auth.js';
import searchRouter from './routes/search.js';
import mePlaylistsRouter from './routes/mePlaylists.js';
import playlistRouter from './routes/playlist.js';
import playerRouter from './routes/player.js';
import { createRequestLogger } from './util/formatHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file if present.
// In production, env vars are typically set by the hosting platform, so a missing .env file is not fatal.
const configResult = config();
if (configResult.error && configResult.error.code !== 'ENOENT') {
    const logger = createRequestLogger();
    logger.error('Error loading .env file:', configResult.error);
    process.exit(1);
};

// Destructure necessary environment variables with default values for base URLs and port
const base_url = process.env.SERVER_BASE_URL || 'http://localhost:3000';
const port = process.env.PORT || process.env.SERVER_PORT || 3000;
// Ensure that the Spotify client ID and secret are set in the environment variables
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    const logger = createRequestLogger();
    logger.error('Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables.');
    process.exit(1);
};

// Create an instance of the Express application
const app = express();

// In production, serve the built React client from client/dist/
const isProduction = process.env.NODE_ENV === 'production';
const clientDistPath = path.join(__dirname, '../../client/dist');

// Middleware setup:
// - express.json() to parse JSON request bodies
// - cors() to enable Cross-Origin Resource Sharing with the client application, allowing credentials (cookies) to be included in requests
// - cookieParser() to parse cookies from incoming requests
app.use(express.json());
app.use(cors({
    origin: isProduction ? process.env.CLIENT_PROD_URL : process.env.CLIENT_DEV_URL,
    credentials: true,
}));
app.use(cookieParser());

if (isProduction) {
    app.use(express.static(clientDistPath));
}

// Route handlers for authentication, search, and playlist management are mounted on their respective paths.
app.use('/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/me/playlists', mePlaylistsRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/player', playerRouter);

// In production, fall back to index.html for any unmatched routes (client-side routing).
if (isProduction) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

// Global error handling middleware to catch any unhandled errors in the request processing pipeline.
// If an error occurs, it logs the error and sends a 500 Internal Server Error response with a generic error message.
app.use((err, req, res, next) => {
    const logger = createRequestLogger();
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server and listen on the specified port. 
// Once the server is running, it logs a message indicating the URL where it's accessible.
app.listen(port, () => {
    const logger = createRequestLogger();
    logger.log(`Listening at ${base_url}`);
});