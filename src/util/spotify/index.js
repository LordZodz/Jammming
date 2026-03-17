import { search, savePlaylist } from './api';
import { getAccessToken } from './auth';
import { clearStoredToken, clearAuthStorage } from './auth';

/**
 * The Spotify object serves as a centralized interface for interacting with the Spotify API.
 */
const Spotify = {
    getAccessToken,
    search,
    savePlaylist,
    clearSession() {
        clearStoredToken();
        clearAuthStorage();
    },
};

export { Spotify };