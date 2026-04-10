import { describe, test, expect, vi } from 'vitest';

// Mock the api module that spotify.js depends on
vi.mock('../../../src/utils/api_spotify/api', () => ({
    search: vi.fn(),
    savePlaylist: vi.fn(),
    playTrack: vi.fn(),
    setRepeat: vi.fn(),
}));

import { Spotify, AUTH_LOGIN, AUTH_TOKEN } from '../../../src/utils/api_spotify/spotify';
import { search, savePlaylist, playTrack, setRepeat } from '../../../src/utils/api_spotify/api';

describe('Spotify index', () => {
    test('Spotify facade exposes api functions', () => {
        expect(Spotify.search).toBe(search);
        expect(Spotify.savePlaylist).toBe(savePlaylist);
        expect(Spotify.playTrack).toBe(playTrack);
        expect(Spotify.setRepeat).toBe(setRepeat);
    });

    test('exports correct AUTH_LOGIN constant', () => {
        expect(AUTH_LOGIN).toBe('/auth/login');
    });

    test('exports correct AUTH_TOKEN constant', () => {
        expect(AUTH_TOKEN).toBe('/auth/token');
    });
});
