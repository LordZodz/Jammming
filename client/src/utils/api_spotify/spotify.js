import { search, savePlaylist } from './api';

const AUTH_LOGIN = "/auth/login";
const AUTH_TOKEN = "/auth/token";

/**
 * The Spotify object serves as a centralized interface for interacting with the Spotify API.
 */
const Spotify = {
    search,
    savePlaylist
};

export { 
    Spotify,
    AUTH_LOGIN,
    AUTH_TOKEN, 
};