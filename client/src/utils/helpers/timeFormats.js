
/**
 * Formats a time value in milliseconds into a string in the format "minutes:seconds".
 * @param {number} ms - The time value in milliseconds.
 * @returns {string} The formatted time string.
 */
const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export {
    formatTime,
}