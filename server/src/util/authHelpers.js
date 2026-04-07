import { webcrypto as crypto } from 'crypto';

/**
 * Generates a random string of the specified length using a secure random number generator.
 * 
 * @param {*} length The desired length of the generated string (default is 64 characters)
 * @returns {string} A securely generated random string
 */
const generateRandomString = (length = 64) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += charset[randomValues[i] % charset.length];
    }

    return result;
};

export { generateRandomString };