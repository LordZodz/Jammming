import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/util/spotify/api', () => ({
    search: vi.fn(),
    savePlaylist: vi.fn(),
}));

vi.mock('../../../src/util/spotify/auth', () => ({
    getAccessToken: vi.fn(),
    clearStoredToken: vi.fn(),
    clearAuthStorage: vi.fn(),
}));

import { Spotify } from '../../../src/util/spotify';
import { getAccessToken, clearAuthStorage, clearStoredToken } from '../../../src/util/spotify/auth';
import { search, savePlaylist } from '../../../src/util/spotify/api';

describe('Spotify index', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('clearSession clears token and auth storage', () => {
        Spotify.clearSession();

        expect(clearStoredToken).toHaveBeenCalledTimes(1);
        expect(clearAuthStorage).toHaveBeenCalledTimes(1);
    });

    test('Spotify facade exposes auth and api functions', () => {
        expect(Spotify.getAccessToken).toBe(getAccessToken);
        expect(Spotify.search).toBe(search);
        expect(Spotify.savePlaylist).toBe(savePlaylist);
    });

    test('clearSession calls cleanup methods in order', () => {
        const order = [];

        vi.mocked(clearStoredToken).mockImplementation(() => {
            order.push('clearStoredToken');
        });
        vi.mocked(clearAuthStorage).mockImplementation(() => {
            order.push('clearAuthStorage');
        });

        Spotify.clearSession();

        expect(order).toEqual(['clearStoredToken', 'clearAuthStorage']);
    });
});