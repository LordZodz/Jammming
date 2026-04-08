const SERVER_URL = import.meta.env.VITE_SERVER_BASE_URL;
const API_SEARCH = "/api/search";
const API_ME_PLAYLISTS = "/api/me/playlists";
const API_PLAYLISTS = "/api/playlists";

/**
 * Parses a JSON response from a fetch request, handling errors gracefully.
 * 
 * @param {*} response The response object returned from a fetch request
 * @returns {Promise<{ok: boolean, status: number, data: any}>} An object containing the success status, HTTP status code, and parsed data (if available)
 */
const parseJsonResponse = async (response) => {
    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
    }

    return { ok: response.ok, status: response.status, data };
};

/**
 * Maps a Spotify track object to a simplified track object used in the application.
 * 
 * @param {*} track The Spotify track object to map.
 * @returns An object containing the track's id, name, artist, album, image URL, and URI. 
 * If any of these properties are missing in the input track object, they will default to an empty string.
 */
const mapTrack = (track) => {
    return {
        id: track?.id || '',
        name: track?.name || '',
        artist: track?.artists?.[0]?.name || '',
        album: track?.album?.name || '',
        image: track?.album?.images?.[0]?.url || '',
        uri: track?.uri || '',
    };
};

/**
 * Searches for tracks on Spotify based on the provided query.
 * 
 * @param {*} query The search query string to use for finding tracks on Spotify.
 * @returns An object containing the search results, including a success status, an array of tracks, and any error message if the search fails. 
 * Each track in the results is mapped to a simplified track object using the mapTrack function.
 */
const search = async (query) => {
    // Trim the query to remove leading/trailing whitespace and check if it's empty after trimming
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
        return {
            ok: false,
            error: 'Search query is required',
            tracks: [],
        };
    };

    // Construct the search URL with the query parameter
    const params = new URLSearchParams({ q: trimmedQuery });
    const SEARCH_QUERY_ENDPOINT = `${SERVER_URL}${API_SEARCH}/searchQuery`;

    // Make a request to the server's search endpoint, including credentials for authentication.
    const result = await parseJsonResponse(
        await fetch(`${SEARCH_QUERY_ENDPOINT}?${params.toString()}`, {
            credentials: 'include',
        })
    );

    // If the search request fails or returns an error, return an object with the error message and an empty tracks array.
    if (!result.ok) {
        return {
            ok: false,
            error: result.error || result.data?.error?.message || 'Spotify search failed.',
            tracks: [],
        };
    }

    // Extract the tracks from the search results and map them to the simplified track objects. 
    // If the expected structure is not present, log an error and return an empty tracks array.
    const items = result.data?.tracks?.items;

    if (!Array.isArray(items)) {
        console.error('Invalid search response from Spotify:', result.data);
        return {
            ok: false,
            error: 'Invalid response from Spotify API.',
            tracks: [],
        };
    }

    return {
        ok: true,
        tracks: items.map(mapTrack),
    };
};

/**
 * Saves a playlist to the user's Spotify account with the specified name and track URIs.
 * 
 * @param {*} name The name of the playlist to create on Spotify. This should be a non-empty string.
 * @param {*} trackUris An array of Spotify track URIs to include in the playlist. This should be a non-empty array of strings.
 * @returns An object containing the result of the save operation, including a success status, the ID of the created playlist, 
 * the snapshot ID of the playlist after adding tracks, and any error message if the operation fails.
 */
const savePlaylist = async (name, trackUris) => {
    const trimmedName = name?.trim();
    const validTracksUris = Array.isArray(trackUris) ? trackUris.filter(Boolean) : [];

    // Validate the playlist name and track URIs before making API calls. 
    // If validation fails, return an object with the appropriate error message.
    if (!trimmedName) {
        return {
            ok: false,
            error: 'Playlist name is required.',
        };
    };

    if (validTracksUris.length === 0) {
        return {
            ok: false,
            error: 'At least one track URI is required.',
        };
    };

    // Construct the URL for creating a new playlist and make a POST request to the server. 
    // The server will handle the interaction with the Spotify API, including authentication and error handling.
    const CREATE_PLAYLIST_ENDPOINT = `${SERVER_URL}${API_ME_PLAYLISTS}/createPlaylist`;
    const createNewPlaylistResult = await parseJsonResponse(
        await fetch(CREATE_PLAYLIST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: trimmedName, public: false }),
            credentials: 'include',
        })
    );

    // If the playlist creation request fails or returns an error, return an object with the error message.
    if (!createNewPlaylistResult.ok || !createNewPlaylistResult.data?.id) {
        return {
            ok: false,
            error:
                createNewPlaylistResult.error ||
                createNewPlaylistResult.data?.error?.message ||
                'Failed to create playlist on Spotify.',
        };
    };

    // Extract the playlist ID from the successful creation response, 
    // then construct the URL for adding tracks to the playlist and make a POST request to the server.
    const playlistId = createNewPlaylistResult.data.id;
    const ADD_TRACKS_TO_PLAYLIST_ENDPOINT = `${SERVER_URL}${API_PLAYLISTS}/${playlistId}/addTracksToPlaylist`;
    const addTracksToNewPlaylistResult = await parseJsonResponse(
        await fetch(ADD_TRACKS_TO_PLAYLIST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: validTracksUris }),
            credentials: 'include',
        })
    );

    // If the request to add tracks to the new playlist fails or returns an error, return an object with the error message.
    if (!addTracksToNewPlaylistResult.ok) {
        console.error('Adding tracks failed:', addTracksToNewPlaylistResult.data || addTracksToNewPlaylistResult.error);
        return {
            ok: false,
            error:
                addTracksToNewPlaylistResult.error ||
                addTracksToNewPlaylistResult.data?.error?.message ||
                'Failed to add tracks to playlist on Spotify.',
        };
    };

    return {
        ok: true,
        playlistId,
        snapshotId: addTracksToNewPlaylistResult.data?.snapshot_id || null,
    };
};

export {
    search,
    savePlaylist,
};