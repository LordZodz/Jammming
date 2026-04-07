// Spotify API configuration and constants
const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "/api/token";
const AUTH_ENDPOINT = "/authorize";

// Storage keys for authentication data
const STORAGE_KEYS = {
    codeVerifier: "spotify_code_verifier",
    authState: "spotify_auth_state",
    accessToken: "spotify_access_token",
    expiresAt: "spotify_token_expires_at",
};

// Scopes required for the application to manage playlists on behalf of the user
const SCOPES = [
    'playlist-modify-public',
    'playlist-modify-private',
].join(' ');

// Client ID and Redirect URI are loaded from environment variables for security and flexibility
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export {
    SPOTIFY_ACCOUNTS_BASE_URL,
    SPOTIFY_API_BASE_URL,
    TOKEN_ENDPOINT,
    AUTH_ENDPOINT,
    STORAGE_KEYS,
    SCOPES,
    clientId,
    redirectUrl,
};