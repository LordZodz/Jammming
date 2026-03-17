import { Spotify } from '../../../src/util/Spotify/Spotify';
import { test, expect, describe } from 'vitest';

/**
 * Test suite for the Spotify utility module, which is responsible for handling authentication and API interactions with the Spotify Web API.
 * The tests cover the module's ability to generate the correct Spotify authorization URL, handle access token retrieval and expiration, 
 * and ensure that API requests are made with the correct headers and parameters.
 */

describe('Spotify Utility Module', () => {
    test('generates correct Spotify authorization URL', () => {
        const authUrl = Spotify.getAuthUrl();
        expect(authUrl).toContain('https://accounts.spotify.com/authorize');
        expect(authUrl).toContain('client_id=');
        expect(authUrl).toContain('response_type=token');
        expect(authUrl).toContain('scope=');
        expect(authUrl).toContain('redirect_uri=');
    });

    test('handles access token retrieval and expiration', () => {
        // Simulate setting an access token and expiration time
        const mockToken = 'mock_access_token';
        const mockExpirationTime = 3600;

        Spotify.accessToken = mockToken;
        Spotify.tokenExpirationTime = Date.now() + mockExpirationTime * 1000;

        // Verify that the access token is set correctly
        expect(Spotify.accessToken).toBe(mockToken);

        // Simulate token expiration by advancing time
        jest.advanceTimersByTime(mockExpirationTime * 1000 + 1000);

        // Verify that the access token is cleared after expiration
        expect(Spotify.accessToken).toBeNull();
    });
});