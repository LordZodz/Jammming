import { getStoredToken, setStoredToken, clearStoredToken } from "./storage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const clearCallbackParams = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
};

/**
 * Retrieves a valid access token for making authenticated requests to the Spotify API.
 * Checks the local cache first. If no valid token is cached, checks the URL for an error
 * returned by the server, then attempts to fetch a token from the server. If the server has
 * no token yet, redirects the user to the server login endpoint to begin authorisation.
 *
 * @returns {Promise<string|null>} A promise that resolves to a valid access token, or null on error
 */
const getAccessToken = async () => {
    const cachedToken = getStoredToken();
    if (cachedToken) {
        return cachedToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
        console.error('Spotify authorization error:', error);
        clearCallbackParams();
        return null;
    };

    try {
        const response = await fetch(`${SERVER_URL}/auth/token`, {
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data?.access_token) {
            setStoredToken(data.access_token, data.expires_in || 3600);
            clearCallbackParams();
            return data.access_token;
        }
    } catch (err) {
        console.error('Failed to fetch token from server:', err);
    }

    window.location.assign(`${SERVER_URL}/auth/login`);
    return null;
};

export {
    getAccessToken,
    clearStoredToken,
};