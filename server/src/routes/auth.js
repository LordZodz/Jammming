import express from 'express';
import { generateRandomString } from '../util/authHelpers.js';
import {
    SCOPES,
    SPOTIFY_ACCOUNTS_BASE_URL,
    TOKEN_ENDPOINT,
    AUTH_ENDPOINT,
    AUTH_CALLBACK,
} from '../config/config.js';

const router = express.Router();

const STATE_COOKIE = 'spotify_auth_state';

let access_token = '';
let expires_in = 3600;

router.get('/login', (req, res) => {
    console.log('Initiating Spotify login flow');
    const state = generateRandomString(16);
    const redirectUri = process.env.SERVER_BASE_URL + AUTH_CALLBACK;
    const spotifyAuthUrl = `${SPOTIFY_ACCOUNTS_BASE_URL}${AUTH_ENDPOINT}`;

    res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax' });

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: redirectUri,
        state,
    });

    try {
        //console.log('Redirecting to Spotify authorization endpoint with params:', params );
        const fullAuthUrl = `${spotifyAuthUrl}?${params.toString()}`;
        res.redirect(fullAuthUrl);
    } catch (err) {
        console.error('Error during redirect to Spotify:', err);
        res.status(500).json({ error: 'Failed to initiate Spotify login' });
    };
});

router.get('/callback', async (req, res) => {
    //console.log('Received callback from Spotify with query params:', req.query);
    const { code, state, error } = req.query;
    const storedState = req.cookies[STATE_COOKIE];
    const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';

    res.clearCookie(STATE_COOKIE);

    if (error) {
        console.log('Spotify returned an error during authorization:', error);
        return res.redirect(`${clientBaseUrl}?error=${encodeURIComponent(error)}`);
    }

    if (!state || !storedState || state !== storedState) {
        console.warn('State mismatch in Spotify callback. Potential CSRF attack.');
        return res.redirect(`${clientBaseUrl}?error=state_mismatch`);
    }

    const credentials = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SERVER_BASE_URL + AUTH_CALLBACK,
    });

    try {
        console.log('Exchanging authorization code for access token with Spotify');
        const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}${TOKEN_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        const data = await response.json();

        if (!response.ok || !data.access_token) {
            console.error('Token exchange failed:', data);
            return res.redirect(`${clientBaseUrl}?error=token_exchange_failed`);
        }

        console.log('Token exchange successful. Received access token from Spotify.');

        access_token = data.access_token;
        expires_in = data.expires_in || 3600;

        res.redirect(clientBaseUrl);
    } catch (err) {
        console.error('Unexpected error during token exchange:', err);
        res.redirect(`${clientBaseUrl}?error=server_error`);
    }
});

router.get('/token', (req, res) => {
    res.json({ access_token, expires_in });
});

export default router;