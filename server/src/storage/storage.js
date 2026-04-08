// This module provides a simple in-memory storage mechanism for the Spotify access token and its expiration time.
let access_token = '';
let expires_at = 0;

// Returns the stored access token if it exists and has not expired, otherwise returns null.
const getAccessToken = () => {
    if (access_token && Date.now() < expires_at) return access_token;
    return null;
};

// Stores the access token and calculates its absolute expiry timestamp from the given duration in seconds.
const setTokenData = (token, expiresInSeconds) => {
    access_token = token;
    expires_at = Date.now() + expiresInSeconds * 1000;
};

export {
    getAccessToken,
    setTokenData,
};