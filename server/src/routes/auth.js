import express from 'express';
import { generateRandomString } from '../util/authHelpers.js';
import {
    SCOPES,
    SPOTIFY_ACCOUNTS_BASE_URL,
    TOKEN_ENDPOINT,
    AUTH_ENDPOINT,
} from '../util/config.js';

const router = express.Router();

const STATE_COOKIE = 'spotify_auth_state';

let access_token = '';

router.get('/login', (req, res) => {
    const state = generateRandomString(16);
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax' });

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: redirectUri,
        state,
    });

    res.redirect(`${SPOTIFY_ACCOUNTS_BASE_URL}${AUTH_ENDPOINT}?${params.toString()}`);
});

router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;
    const storedState = req.cookies[STATE_COOKIE];
    const clientBaseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';

    res.clearCookie(STATE_COOKIE);

    if (error) {
        return res.redirect(`${clientBaseUrl}?error=${encodeURIComponent(error)}`);
    }

    if (!state || !storedState || state !== storedState) {
        return res.redirect(`${clientBaseUrl}?error=state_mismatch`);
    }

    const credentials = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

    try {
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

        access_token = data.access_token;

        res.redirect(clientBaseUrl);
    } catch (err) {
        console.error('Unexpected error during token exchange:', err);
        res.redirect(`${clientBaseUrl}?error=server_error`);
    }
});

router.get('/token', (req, res) => {
    res.json({ access_token });
});

export default router;