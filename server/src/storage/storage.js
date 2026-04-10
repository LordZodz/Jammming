// This module provides a simple in-memory storage mechanism for the Spotify access token and its expiration time.
let access_token = '';
let expires_at = 0;
let _warningTimers = [];

// Thresholds (ms before expiry) at which a console warning is emitted.
const WARNING_THRESHOLDS_MS = [
    30 * 60 * 1000,
    15 * 60 * 1000,
    10 * 60 * 1000,
     5 * 60 * 1000,
     2 * 60 * 1000,
     1 * 60 * 1000,
];

const _formatMinutes = (ms) => {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds === 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes}m ${seconds}s`;
};

const _scheduleTokenWarnings = (expiresInMs) => {
    // Clear any timers from a previous token.
    _warningTimers.forEach(clearTimeout);
    _warningTimers = [];

    for (const thresholdMs of WARNING_THRESHOLDS_MS) {
        const delayMs = expiresInMs - thresholdMs;
        if (delayMs > 0) {
            _warningTimers.push(
                setTimeout(() => {
                    console.warn(`[${new Date().toISOString()}] [TOKEN] ⚠  Access token expires in ${_formatMinutes(thresholdMs)}.`);
                }, delayMs)
            );
        }
    }

    // Final notification at expiry.
    _warningTimers.push(
        setTimeout(() => {
            console.warn(`[${new Date().toISOString()}] [TOKEN] 🔴 Access token has expired. All active client sessions are now unauthenticated.`);
        }, expiresInMs)
    );
};

// Returns the stored access token if it exists and has not expired, otherwise returns null.
const getAccessToken = () => {
    if (access_token && Date.now() < expires_at) return access_token;
    return null;
};

// Stores the access token and calculates its absolute expiry timestamp from the given duration in seconds.
const setTokenData = (token, expiresInSeconds) => {
    access_token = token;
    const expiresInMs = expiresInSeconds * 1000;
    expires_at = Date.now() + expiresInMs;
    console.log(`[${new Date().toISOString()}] [TOKEN] ✅ Access token stored. Expires in ${_formatMinutes(expiresInMs)}.`);
    _scheduleTokenWarnings(expiresInMs);
};

export {
    getAccessToken,
    setTokenData,
};