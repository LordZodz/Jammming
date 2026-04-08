import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../src/util/spotify/storage', () => ({
	getStoredToken: vi.fn(),
	setStoredToken: vi.fn(),
	clearStoredToken: vi.fn(),
}));

import { getAccessToken } from '../../../src/util/spotify/auth';
import { getStoredToken, setStoredToken } from '../../../src/util/spotify/storage';

describe('auth utilities', () => {
	let locationSearch = '';
	const assignMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		assignMock.mockReset();
		locationSearch = '';

		vi.stubGlobal('fetch', vi.fn());

		vi.mocked(getStoredToken).mockReturnValue(null);

		vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		// window.location.assign is non-configurable in jsdom — replace the whole location object
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: {
				assign: assignMock,
				get search() { return locationSearch; },
				pathname: '/',
			},
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('getAccessToken returns cached token without fetching from server', async () => {
		vi.mocked(getStoredToken).mockReturnValue('cached-token');

		const token = await getAccessToken();

		expect(token).toBe('cached-token');
		expect(fetch).not.toHaveBeenCalled();
	});

	test('getAccessToken logs error and returns null when URL contains an error param', async () => {
		locationSearch = '?error=access_denied';

		const token = await getAccessToken();

		expect(token).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Spotify authorization error:', 'access_denied');
		expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, window.location.pathname);
	});

	test('getAccessToken stores and returns the token from server when available', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ access_token: 'server-token', expires_in: 3600 }),
		});

		const token = await getAccessToken();

		expect(token).toBe('server-token');
		expect(setStoredToken).toHaveBeenCalledWith('server-token', 3600);
		expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, window.location.pathname);
	});

	test('getAccessToken uses fallback expiry of 3600 when server omits expires_in', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ access_token: 'server-token' }),
		});

		await getAccessToken();

		expect(setStoredToken).toHaveBeenCalledWith('server-token', 3600);
	});

	test('getAccessToken redirects to server login when server has no token yet', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ access_token: '' }),
		});

		const token = await getAccessToken();

		expect(token).toBeNull();
		expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
	});

	test('getAccessToken redirects to server login when server fetch fails', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

		const token = await getAccessToken();

		expect(token).toBeNull();
		expect(console.error).toHaveBeenCalledWith('Failed to fetch token from server:', expect.any(Error));
		expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
	});
});
