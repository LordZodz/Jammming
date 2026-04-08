import { getAccessToken } from "./auth";
import { parseJsonResponse } from "./parse";

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
 * Fetches data from the Spotify API using an access token for authentication.
 * 
 * @param {*} url The URL to fetch.
 * @param {*} options The options to pass to the fetch function.
 * @returns An object containing the result of the fetch operation, including the status, data, and any error message.
 */
const fetchWithAccessToken = async (url, options = {}) => {
    const token = await getAccessToken();

    if (!token) {
        return { ok: false, error: 'No access token available' };
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
            },
        });

        const { ok, status, data } = await parseJsonResponse(response);
        return { ok, status, data };
    } catch (error) {
        console.error('Network request failed:', error);
        return { ok: false, error: error.message || 'Network request failed' };
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
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
        return {
            ok: false,
            error: 'Search query is required',
            tracks: [],
        };
    }

    const params = new URLSearchParams({
        type: 'track',
        q: trimmedQuery,
    });

    const result = await fetchWithAccessToken(
        `${SPOTIFY_API_BASE_URL}/search?${params.toString()}`,
        {
            method: 'GET'
        }
    );

    if (!result.ok) {
        return {
            ok: false,
            error: result.error || result.data?.error?.message || 'Spotify search failed.',
            tracks: [],
        };
    }

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

    const createPlaylistResult = await fetchWithAccessToken(
        `${SPOTIFY_API_BASE_URL}/me/playlists`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: trimmedName,
                public: false,
            }),
        }
    );

    if (!createPlaylistResult.ok || !createPlaylistResult.data?.id) {
        return {
            ok: false,
            error:
                createPlaylistResult.error ||
                createPlaylistResult.data?.error?.message ||
                'Failed to create playlist on Spotify.',
        };
    };

    const playlistId = createPlaylistResult.data.id;

    const addTracksResult = await fetchWithAccessToken(
        `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/items`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: validTracksUris,
            }),
        }
    );

    if (!addTracksResult.ok) {
        console.error('Adding tracks failed:', addTracksResult.data || addTracksResult.error);
        return {
            ok: false,
            error:
                addTracksResult.error ||
                addTracksResult.data?.error?.message ||
                'Failed to add tracks to playlist on Spotify.',
        };
    };

    return {
        ok: true,
        playlistId,
        snapshotId: addTracksResult.data?.snapshot_id || null,
    };
};

export {
    fetchWithAccessToken,
    search,
    savePlaylist,
};