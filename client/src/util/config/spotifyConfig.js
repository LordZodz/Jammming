// Spotify API configuration and constants
const AUTH_LOGIN = "/auth/login";
const AUTH_TOKEN = "/auth/token";

// Storage keys for caching the access token
const STORAGE_KEYS = {
    accessToken: "spotify_access_token",
    expiresAt: "spotify_token_expires_at",
};

export {
    STORAGE_KEYS,
    AUTH_LOGIN,
    AUTH_TOKEN,
};