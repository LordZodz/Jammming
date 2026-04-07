import { STORAGE_KEYS } from './config.js';

let accessToken = '';
let expiresAt = 0;

/**
 * Retrieves the stored access token from memory or sessionStorage if it is still valid. 
 * If the token has expired or is not found, it clears any stored token information and returns null.
 * 
 * @returns {string|null} The valid access token if available, otherwise null
 */
function getStoredToken() {
    if (accessToken && expiresAt > Date.now()) {
        return accessToken;
    }

    const storedToken = sessionStorage.getItem(STORAGE_KEYS.accessToken);
    const storedExpiresAt = Number(sessionStorage.getItem(STORAGE_KEYS.expiresAt) || 0);

    if (storedToken && storedExpiresAt > Date.now()) {
        accessToken = storedToken;
        expiresAt = storedExpiresAt;

        return accessToken;
    }

    clearStoredToken();
    return null;
};

/**
 * Stores the access token and its expiration time in memory and sessionStorage.
 * 
 * @param {*} token The access token to store
 * @param {*} expiresInSeconds The number of seconds until the token expires, used to calculate the expiration time
 */
function setStoredToken(token, expiresInSeconds) {
    accessToken = token;
    expiresAt = Date.now() + expiresInSeconds * 1000;

    sessionStorage.setItem(STORAGE_KEYS.accessToken, token);
    sessionStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt));
}

/**
 * Clears the stored access token from memory and sessionStorage, 
 * effectively logging the user out of Spotify and requiring re-authentication for future API requests.
 */
function clearStoredToken() {
    accessToken = '';
    expiresAt = 0;

    sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
};

/**
 * Clears the PKCE code verifier and state from localStorage, 
 * which are used during the authentication process.
 */
function clearAuthStorage() {
    localStorage.removeItem(STORAGE_KEYS.codeVerifier);
    localStorage.removeItem(STORAGE_KEYS.authState);
};

export {
    getStoredToken,
    setStoredToken,
    clearStoredToken,
    clearAuthStorage,
};