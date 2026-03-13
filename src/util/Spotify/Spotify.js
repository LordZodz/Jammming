
// URL Constants and variables for Spotify authentication
const urlBaseAccounts = "https://accounts.spotify.com";
const urlBaseApi = "https://api.spotify.com/v1";
const tokenEndpoint = `/api/token`;
const authEndpoint = `/authorize`;

let accessToken = "";
let expiresAt = 0;

const clientId = "25c59576d9d648478ff413b4799c7b70";
const redirectUrl = "http://127.0.0.1:5173/callback";

/**
 * A helper function to generate a random string of a specified length, using characters that are URL-safe.
 * 
 * @param {number} length The desired length of the generated string. Default is 128 characters.
 * @returns {string} A random string of the specified length, consisting of URL-safe characters.
 */
function generateCodeVerifier(length = 128) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let verifier = '';
    for (let i = 0; i < length; i++) {
        verifier += chars.charAt(Math.floor(Math.random() * chars.length));
    };
    return verifier;
};

/**
 * A helper function to create a SHA-256 hash of a given string and encode it in base64 URL format.
 * 
 * @param {*} plain The input string to hash and encode.
 * @returns {Promise<string>} A promise that resolves to the base64 URL-encoded SHA-256 hash of the input string.
 */
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

/**
 * The Spotify object provides methods for handling authentication with the Spotify API, searching for tracks, and saving playlists.
 * It uses the PKCE (Proof Key for Code Exchange) flow for secure authentication and manages access tokens, including their expiration.
 * The search method allows users to search for tracks based on a query string, while the savePlaylist method enables users to create and save playlists to their Spotify account.
 * 
 * @namespace Spotify
 */
const Spotify = {
    async getAccessToken() {
        // Return cached token only while it is still valid.
        if (accessToken && expiresAt > Date.now()) {
            return accessToken;
        }

        // If the cached token has expired, clear the in-memory token state.
        if (accessToken && expiresAt <= Date.now()) {
            accessToken = "";
            expiresAt = 0;
        }

        // Use URLSearchParams to check if the browser URL contains a valid authorization code and check for any error responses.
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        // If an error is present in the URL parameters, log the error and return null to indicate that authentication failed.
        if (error) {
            console.error("Error during authentication:", error);
            return;
        };

        // If a code is present in the URL, retreive the code verifier from local storage.
        if (code) {
            const codeVerifier = localStorage.getItem("code_verifier");

            if (!codeVerifier) {
                console.error("Missing code_verifier in localStorage.");
                return null;
            }

            const body = new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUrl,
                client_id: clientId,
                code_verifier: codeVerifier,
            });

            const response = await fetch(`${urlBaseAccounts}${tokenEndpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body.toString(),
            });

            const data = await response.json();
            //console.log("Token exchange response:", data);

            if (data.access_token) {
                accessToken = data.access_token;
                expiresAt = Date.now() + data.expires_in * 1000;

                // Clear callback params while preserving current route path.
                window.history.replaceState({}, document.title, window.location.pathname);
                return accessToken;
            } else {
                console.error("Token exchange failed", data);
                return null;
            };
        };

        const codeVerifier = generateCodeVerifier();
        //console.log("Generated code verifier:", codeVerifier);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        localStorage.setItem("code_verifier", codeVerifier);
        //console.log("Generated codeVerifier in localStorage:", localStorage.getItem("code_verifier"));

        // Construct the Spotify authorization URL using the code_challenge_method=S256 and the generated codeChallenge.
        const params = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: "playlist-modify-public playlist-modify-private",
            redirect_uri: redirectUrl,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
        });
        const redirect = `${urlBaseAccounts}${authEndpoint}?${params.toString()}`;

        // Redirect the user to the Spotify authorization URL to complete the authentication process.
        window.location.href = redirect;
    },

    // Implement the search method to allow users to search for tracks using the Spotify API.
    async search(query) {
        // Ensure that a search query is provided before attempting to make the API request.
        if (!query) {
            console.error("Search query is required.");
            return [];
        };

        // Retrieve a valid access token before making the API request to search for tracks.
        const token = await Spotify.getAccessToken();
        if (!token) {
            console.error("No access token available.");
            return [];
        };

        return fetch(`${urlBaseApi}/search?type=track&q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => response.json())
            .then((jsonResponse) => {
                if (!jsonResponse || typeof jsonResponse !== "object" || !jsonResponse.tracks) {
                    console.error("Invalid response from Spotify API:", jsonResponse);
                    return [];
                };
                return jsonResponse.tracks.items.map((t) => ({
                    id: t.id,
                    name: t.name,
                    artist: t.artists[0].name,
                    album: t.album.name,
                    image: t.album.images[0]?.url || "",
                    uri: t.uri,
                }));
            });
    },

    // Implement the savePlaylist method to allow users to save a playlist to their Spotify account.
    async savePlaylist(name, trackUris) {
        // Ensure that both a playlist name and an array of track URIs are provided before attempting to save the playlist. 
        // If either is missing, log an error and return without making the API request.
        if (!name || !trackUris.length) {
            console.error("Playlist name and track URIs are required to save a playlist.");
            return;
        };

        // Retrieve a valid access token before making the API requests to create the playlist and add tracks to it.
        const token = await Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };
        let userId;

        // Make a series of API requests to create a new playlist and add tracks to it.
        return fetch(`${urlBaseApi}/me`, { headers })
            .then((response) => response.json())
            .then((jsonResponse) => {
                userId = jsonResponse.id;

                return fetch(`${urlBaseApi}/users/${userId}/playlists`, {
                    method: "POST",
                    headers: {
                        ...headers,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name }),
                });
            })
            .then((response) => response.json())
            .then((jsonResponse) => {
                const playlistId = jsonResponse.id;

                return fetch(`${urlBaseApi}/playlists/${playlistId}/tracks`, {
                    method: "POST",
                    headers: {
                        ...headers,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uris: trackUris }),
                });
            });
    },
};

export { Spotify };