const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const TOKEN_ENDPOINT = "/api/token";
const AUTH_ENDPOINT = "/authorize";

const SCOPES = [
    'playlist-modify-public',
    'playlist-modify-private',
    'streaming',
    'user-read-email',
    'user-read-private',
].join(' ');

export {
    SCOPES,
    SPOTIFY_ACCOUNTS_BASE_URL,
    SPOTIFY_API_BASE_URL,
    TOKEN_ENDPOINT,
    AUTH_ENDPOINT,
};