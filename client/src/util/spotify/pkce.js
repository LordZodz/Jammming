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

export {
    generateRandomString,
    generateCodeVerifier,
    generateCodeChallenge,
}