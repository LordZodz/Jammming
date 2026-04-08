import { search, savePlaylist } from './api';
import { getAccessToken, clearStoredToken } from './auth';

/**
 * The Spotify object serves as a centralized interface for interacting with the Spotify API.
 */
const Spotify = {
    getAccessToken,
    search,
    savePlaylist,
    clearSession() {
        clearStoredToken();
    },
};

export { Spotify };