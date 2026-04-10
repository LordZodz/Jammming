import express from 'express';
import { createRequestLogger } from '../util/formatHelpers.js';
import { getAccessToken } from '../storage/storage.js';
import { SPOTIFY_API_BASE_URL, SEARCH_ENDPOINT } from '../config/config.js';

const router = express.Router();

router.get('/searchQuery', async (req, res) => {
    const logger = createRequestLogger();
    logger.log(`Received search request with the following query: ${req.query.q}`);

    const token = getAccessToken();

    if (!token) {
        logger.warn('No access token available for search request');
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    };

    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Missing required query parameter: q' });
    }

    const params = new URLSearchParams({
        q,
        type: 'track,artist,album',
    });

    try {
        const searchUrl = `${SPOTIFY_API_BASE_URL}${SEARCH_ENDPOINT}?${params.toString()}`;
        logger.log('Fetching search results from Spotify');

        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        logger.log(`Search results received from Spotify with status: ${response.status}`);
        res.json(data);
    } catch (error) {
        logger.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;