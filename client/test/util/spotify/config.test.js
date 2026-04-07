import { describe, test, expect, vi, afterEach } from 'vitest';
import { STORAGE_KEYS } from '../../../src/util/spotify/config';

describe('Spotify config constants', () => {
    test('SPOTIFY_ACCOUNTS_BASE_URL is correct', () => {
        expect(STORAGE_KEYS).toEqual({
            codeVerifier: "spotify_code_verifier",
            authState: "spotify_auth_state",
            accessToken: "spotify_access_token",
            expiresAt: "spotify_token_expires_at",
        });
    });
});