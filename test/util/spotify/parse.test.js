import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseJsonResponse } from '../../../src/util/spotify/parse';

describe('parseJsonResponse', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns ok, status, and parsed data when response.json resolves successfully', async () => {
        const mockData = {
            access_token: 'test-token',
            expires_in: 3600,
        };

        const response = {
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue(mockData),
        };

        const result = await parseJsonResponse(response);

        expect(response.json).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            ok: true,
            status: 200,
            data: mockData,
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('returns ok, status, and null data when response.json throws an error', async () => {
        const parseError = new Error('Invalid JSON');

        const responses = {
            ok: false,
            status: 500,
            json: vi.fn().mockRejectedValue(parseError),
        };

        const result = await parseJsonResponse(responses);

        expect(responses.json).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            ok: false,
            status: 500,
            data: null,
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to parse JSON response:',
            parseError
        );
    });

    test('preserves response metadata even when parsed data is null', async () => {
        const response = {
            ok: false,
            status: 204,
            json: vi.fn().mockRejectedValue(new Error('No JSON body')),
        };

        const result = await parseJsonResponse(response);

        expect(result.ok).toBe(false);
        expect(result.status).toBe(204);
        expect(result.data).toBeNull();
    });
});