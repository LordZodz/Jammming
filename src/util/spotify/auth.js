import { SPOTIFY_ACCOUNTS_BASE_URL, TOKEN_ENDPOINT, AUTH_ENDPOINT, STORAGE_KEYS, SCOPES, clientId, redirectUrl } from "./config";
import { parseJsonResponse } from "./parse";

let accessToken = '';
let expiresAt = 0;

/**
 * Helper function to perform base64 URL encoding, which is required for the PKCE code challenge.
 * 
 * @param {Uint8Array} bytes The input byte array to encode
 * @returns {string} Base64 URL encoded string
 */
function base64UrlEncode(bytes) {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Generates a random string of the specified length using a secure random number generator.
 * 
 * @param {*} length The desired length of the generated string (default is 64 characters)
 * @returns {string} A securely generated random string
 */
function generateRandomString(length = 64) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += charset[randomValues[i] % charset.length];
    }

    return result;
};

/**
 * Generates a code verifier for the PKCE flow.
 * 
 * @param {*} length The desired length of the code verifier (default is 128 characters)
 * @returns {string} A securely generated code verifier string
 */
function generateCodeVerifier(length = 128) {
    return generateRandomString(length);
};

/**
 * Generates a code challenge for the PKCE flow based on the provided code verifier.
 * 
 * @param {*} codeVerifier The code verifier string for which to generate the code challenge
 * @returns {Promise<string>} A promise that resolves to the generated code challenge string
 */
async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
};

/**
 * Clears any query parameters from the URL after the authentication process is complete to 
 * prevent issues with page reloads and to enhance security by removing sensitive information from the URL.
 */
function clearCallbackParams() {
    window.history.replaceState({}, document.title, window.location.pathname);
};

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

/**
 * Exchanges the authorization code for an access token using the PKCE flow.
 * 
 * @param {*} code The authorization code received from Spotify after the user authorizes the application
 * @returns {Promise<string|null>} A promise that resolves to the access token if the exchange is successful, otherwise null
 */
async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);
    const storedState = localStorage.getItem(STORAGE_KEYS.authState);
    const urlParams = new URLSearchParams(window.location.search);
    const returnedState = urlParams.get("state");

    if (!codeVerifier) {
        console.error("Missing PKCE code verifier in localStorage.");
        return null;
    };

    if (!storedState || !returnedState || storedState !== returnedState) {
        console.error('Invalid or missing state parameter during authentication. Potential CSRF attack.');
        clearAuthStorage();
        clearCallbackParams();
        return null;
    };

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUrl,
        client_id: clientId,
        code_verifier: codeVerifier,
    });

    try {
        const reponse = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}${TOKEN_ENDPOINT}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        const { ok, data } = await parseJsonResponse(reponse);

        if (!ok || !data?.access_token || !data?.expires_in) {
            console.error("Token exchange failed:", data);
            clearAuthStorage();
            clearCallbackParams();
            return null;
        }

        setStoredToken(data.access_token, data.expires_in);
        clearAuthStorage();
        clearCallbackParams();

        return data.access_token;
    } catch (error) {
        console.error("Unexpected error exchanging code for token:", error);
        clearAuthStorage();
        clearCallbackParams();
        return null;
    };
};

/**
 * Initiates the Spotify authorization process by generating a PKCE code verifier and challenge,
 * storing necessary information in localStorage, and redirecting the user to the Spotify authorization page.
 * 
 * @returns {Promise<null>} A promise that resolves to null after initiating the authorization process
 */
async function redirectToSpotifyAuthorization() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    localStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
    localStorage.setItem(STORAGE_KEYS.authState, state);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: SCOPES,
        redirect_uri: redirectUrl,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        state,
    });

    window.location.assign(
        `${SPOTIFY_ACCOUNTS_BASE_URL}${AUTH_ENDPOINT}?${params.toString()}`
    );

    return null;
};

/**
 * Retrieves a valid access token for making authenticated requests to the Spotify API.
 * It first checks for a cached token and returns it if valid. 
 * If no valid token is found, it checks the URL for an authorization code or error.
 * If an authorization code is present, it attempts to exchange it for an access token. 
 * If an error is present, it logs the error and clears any stored authentication data.
 * If neither is present, it initiates the Spotify authorization process by redirecting the user to the Spotify login page.
 * 
 * @returns {Promise<string|null>} A promise that resolves to a valid access token if available, otherwise null
 */
async function getAccessToken() {
    const cachedToken = getStoredToken();
    if (cachedToken) {
        return cachedToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
        console.error('Spotify authorization error:', error);
        clearAuthStorage();
        clearCallbackParams();
        return null;
    };

    if (code) {
        return exchangeCodeForToken(code);
    };

    return redirectToSpotifyAuthorization();
};


export {
    exchangeCodeForToken,
    redirectToSpotifyAuthorization,
    getAccessToken,
    clearStoredToken,
    clearAuthStorage,
};