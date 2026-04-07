import { SPOTIFY_ACCOUNTS_BASE_URL, TOKEN_ENDPOINT, AUTH_ENDPOINT, STORAGE_KEYS, SCOPES, clientId, redirectUrl } from "./config";
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from "./pkce";
import { getStoredToken, setStoredToken, clearStoredToken, clearAuthStorage } from "./storage";
import { parseJsonResponse } from "./parse";

/**
 * Clears any query parameters from the URL after the authentication process is complete to 
 * prevent issues with page reloads and to enhance security by removing sensitive information from the URL.
 */
function clearCallbackParams() {
    window.history.replaceState({}, document.title, window.location.pathname);
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