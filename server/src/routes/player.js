import express from 'express';
import { createRequestLogger } from '../util/formatHelpers.js';
import { getAccessToken } from '../storage/storage.js';
import { SPOTIFY_API_BASE_URL } from '../config/config.js';

const router = express.Router();

router.put('/play', async (req, res) => {
    const logger = createRequestLogger();
    logger.log(`Received request to start playback with deviceId: ${req.body.deviceId} and uri: ${req.body.uri}`);
    
    const token = getAccessToken();

    if (!token) {
        logger.warn('No access token available for start playback request');
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    };

    const { deviceId, uri } = req.body;

    if (!deviceId) {
        logger.warn('Missing required field: deviceId');
        return res.status(400).json({ error: 'Missing required field: deviceId' });
    };

    if (!uri) {
        logger.warn('Missing required field: uri');
        return res.status(400).json({ error: 'Missing required field: uri' });
    };

    try {
        const playUrl = `${SPOTIFY_API_BASE_URL}/me/player/play?device_id=${encodeURIComponent(deviceId)}`;

        const response = await fetch(playUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [uri] }),
        });

        // Spotify returns 204 No Content on success — no body to parse
        if (response.status === 204) {
            return res.status(204).send();
        };

        try {
            const data = await response.json();
            res.status(response.status).json(data);
        } catch {
            res.status(response.status).json({ error: `Spotify returned a non-JSON error (status ${response.status})` });
        }
    } catch (error) {
        logger.error('Error starting playback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    };
});

router.put('/repeat', async (req, res) => {
    const logger = createRequestLogger();
    const token = getAccessToken();

    if (!token) {
        logger.warn('No access token available for set repeat mode request');
        return res.status(401).json({ error: 'Unauthorized: No access token available' });
    };

    const { state } = req.body;
    const validStates = ['off', 'context', 'track'];

    if (!state || !validStates.includes(state)) {
        logger.warn(`Invalid or missing repeat state. Must be 'off', 'context', or 'track'.`);
        return res.status(400).json({ error: "Invalid or missing repeat state. Must be 'off', 'context', or 'track'." });
    };

    try {
        const repeatUrl = `${SPOTIFY_API_BASE_URL}/me/player/repeat?state=${encodeURIComponent(state)}`;

        const response = await fetch(repeatUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Spotify returns 204 No Content on success
        if (response.status === 204) {
            return res.status(204).send();
        };

        try {
            const data = await response.json();
            res.status(response.status).json(data);
        } catch {
            res.status(response.status).json({ error: `Spotify returned a non-JSON error (status ${response.status})` });
        }
    } catch (error) {
        logger.error('Error setting repeat mode:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    };
});

export default router;
