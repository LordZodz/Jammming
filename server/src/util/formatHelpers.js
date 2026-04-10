import { randomUUID } from 'crypto';

/**
 * Creates a request-scoped logger that binds a single ISO 8601 timestamp and
 * correlation ID (UUID) at construction time. All methods share the same prefix,
 * so every log line for a given request can be correlated in the output.
 *
 * @returns {{ log: Function, warn: Function, error: Function }}
 *
 * @example
 * const logger = createRequestLogger();
 * logger.log('Received search request');
 * logger.warn('No access token available');
 * logger.error('Fetch failed:', err);
 * // [2026-04-09T15:45:22.123Z] [a3f1c2d4-...] - Received search request
 * // [2026-04-09T15:45:22.123Z] [a3f1c2d4-...] - No access token available
 * // [2026-04-09T15:45:22.123Z] [a3f1c2d4-...] - Fetch failed: ...
 */
function createRequestLogger() {
    const prefix = `[${new Date().toISOString()}] [${randomUUID()}]`;
    return {
        log:   (message, ...args) => console.log(`${prefix} - ${message}`, ...args),
        warn:  (message, ...args) => console.warn(`${prefix} - ${message}`, ...args),
        error: (message, ...args) => console.error(`${prefix} - ${message}`, ...args),
    };
};

export {
    createRequestLogger,
};