import express from 'express';
import { createRequestLogger } from '../util/formatHelpers.js';
import { getAccessToken } from '../storage/storage.js';
import { SPOTIFY_API_BASE_URL, ME_PLAYLISTS_ENDPOINT } from '../config/config.js';

const router = express.Router();

router.post('/createPlaylist', async (req, res) => {
    const logger = createRequestLogger();
    logger.log(`Received request to create a new playlist with name: ${req.body.name}`);

    const token = getAccessToken();

    if (!token) {
        logger.warn('No access token available for create playlist request');
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    };

    const { name, public: publicStatus } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing required field: name' });
    };

    if (typeof publicStatus !== 'boolean') {
        return res.status(400).json({ error: 'Invalid value for field: public must be a boolean' });
    };

    try {
        const createPlaylistUrl = `${SPOTIFY_API_BASE_URL}${ME_PLAYLISTS_ENDPOINT}`;

        const response = await fetch(createPlaylistUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, public: publicStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            logger.error('Error creating playlist:', errorData);
            return res.status(response.status).json({ error: errorData.error?.message || 'Failed to create playlist on Spotify.' });
        };

        logger.log('Playlist created successfully on Spotify');
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        logger.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    };
});

export default router;