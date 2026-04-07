/**
 * Parses a JSON response from a fetch request, handling errors gracefully.
 * 
 * @param {*} response The response object returned from a fetch request
 * @returns {Promise<{ok: boolean, status: number, data: any}>} An object containing the success status, HTTP status code, and parsed data (if available)
 */
async function parseJsonResponse(response) {
    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
    }

    return { ok: response.ok, status: response.status, data };
};

export {
    parseJsonResponse,
};