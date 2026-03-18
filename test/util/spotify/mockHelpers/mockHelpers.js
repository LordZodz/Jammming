/**
 * Creates a mock implementation of the Web Storage API (localStorage and sessionStorage) for testing purposes.
 * This allows us to test the storage-related functions without relying on the actual browser storage,
 * which is not available in the test environment. The mock uses a simple Map to store key-value pairs in memory.
 * 
 * @returns {Object} An object that mimics the Web Storage API with getItem, setItem, removeItem, and clear methods
 */
function createStorageMock() {
    const store = new Map();

    return {
        getItem: (key) => store.get(String(key)) ?? null,
        setItem: (key, value) => {
            store.set(String(key), String(value));
        },
        removeItem: (key) => {
            store.delete(String(key));
        },
        clear: () => {
            store.clear();
        },
    };
};

export { createStorageMock };