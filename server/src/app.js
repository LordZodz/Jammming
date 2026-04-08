import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth.js';
import searchRouter from './routes/search.js';
import mePlaylistsRouter from './routes/mePlaylists.js';
import playlistRouter from './routes/playlist.js';

// load environment variables from .env file. 
// If there's an error, log it and exit the process.
const configResult = config();
if (configResult.error) {
    console.error('Error loading .env file:', configResult.error);
    process.exit(1);
};

// Destructure necessary environment variables with default values for base URLs and port
const base_url = process.env.SERVER_BASE_URL || 'http://localhost:3000';
const port = process.env.SERVER_PORT || 3000;
// Ensure that the Spotify client ID and secret are set in the environment variables
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables.');
    process.exit(1);
};

// Create an instance of the Express application
const app = express();

// Middleware setup:
// - express.json() to parse JSON request bodies
// - cors() to enable Cross-Origin Resource Sharing with the client application, allowing credentials (cookies) to be included in requests
// - cookieParser() to parse cookies from incoming requests
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
}));
app.use(cookieParser());

// Route handlers for authentication, search, and playlist management are mounted on their respective paths.
app.use('/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/me/playlists', mePlaylistsRouter);
app.use('/api/playlists', playlistRouter);

// Global error handling middleware to catch any unhandled errors in the request processing pipeline.
// If an error occurs, it logs the error and sends a 500 Internal Server Error response with a generic error message.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server and listen on the specified port. 
// Once the server is running, it logs a message indicating the URL where it's accessible.
app.listen(port, () => {
    console.log(`Listening at ${base_url}`);
});