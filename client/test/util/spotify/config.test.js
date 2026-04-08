import { describe, test, expect } from 'vitest';
import { STORAGE_KEYS } from '../../../src/util/config/spotifyConfig';

describe('Spotify config constants', () => {
    test('STORAGE_KEYS contains access token and expiry keys', () => {
        expect(STORAGE_KEYS).toEqual({
            accessToken: "spotify_access_token",
            expiresAt: "spotify_token_expires_at",
        });
    });
});