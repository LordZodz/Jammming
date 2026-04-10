import express from 'express';
import { createRequestLogger } from '../util/formatHelpers.js';
import { getAccessToken } from '../storage/storage.js';
import { SPOTIFY_API_BASE_URL, PLAYLISTS_ENDPOINT } from '../config/config.js';

const router = express.Router();

router.post('/:playlistId/addTracksToPlaylist', async (req, res) => {
    const logger = createRequestLogger();
    logger.log(`Received request to add tracks to playlist with id: ${req.params.playlistId}`);

    const token = getAccessToken();

    if (!token) {
        logger.warn('No access token available for add tracks to playlist request');
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    };

    const { playlistId } = req.params;
    const { uris } = req.body;

    if (!playlistId) {
        return res.status(400).json({ error: 'Missing required field: playlistId' });
    };

    if (!uris || !Array.isArray(uris) || uris.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid required field: uris must be a non-empty array' });
    };

    try {
        const addTracksUrl = `${SPOTIFY_API_BASE_URL}${PLAYLISTS_ENDPOINT}/${playlistId}/items`;

        const response = await fetch(addTracksUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            logger.error('Error adding tracks to playlist:', errorData);
            return res.status(response.status).json({ error: errorData.error?.message || 'Failed to add tracks to playlist on Spotify.' });
        };

        logger.log('Tracks added successfully to playlist on Spotify');

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        logger.error('Error adding tracks to playlist:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    };
});

export default router;