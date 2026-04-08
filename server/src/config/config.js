// config.js
// Centralized configuration file for the server application, defining constants for Spotify API integration and application settings.

// Base URLs for Spotify API endpoints
const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Endpoints for authentication flow
const AUTH_ENDPOINT = "/authorize";
const AUTH_CALLBACK_ENDPOINT = "/auth/callback";
const TOKEN_ENDPOINT = "/api/token";

// Endpoints for search functionality
const SEARCH_ENDPOINT = "/search";

// Endpoints for playlist management
const ME_PLAYLISTS_ENDPOINT = "/me/playlists";
const PLAYLISTS_ENDPOINT = "/playlists";

// Scopes required for the application to function properly, 
// defined as a space-separated string for use in the Spotify authorization flow.
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
].join(' ');

export {
    SCOPES,
    SPOTIFY_ACCOUNTS_BASE_URL,
    SPOTIFY_API_BASE_URL,
    TOKEN_ENDPOINT,
    AUTH_ENDPOINT,
    AUTH_CALLBACK_ENDPOINT,
    SEARCH_ENDPOINT,
    ME_PLAYLISTS_ENDPOINT,
    PLAYLISTS_ENDPOINT,
};