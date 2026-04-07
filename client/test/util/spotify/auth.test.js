import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../src/util/spotify/config', () => ({
	SPOTIFY_ACCOUNTS_BASE_URL: 'https://accounts.spotify.test',
	TOKEN_ENDPOINT: '/api/token',
	AUTH_ENDPOINT: '/authorize',
	STORAGE_KEYS: {
		codeVerifier: 'spotify_code_verifier',
		authState: 'spotify_auth_state',
		accessToken: 'spotify_access_token',
		expiresAt: 'spotify_token_expires_at',
	},
	SCOPES: 'playlist-modify-public playlist-modify-private',
	clientId: 'test-client-id',
	redirectUrl: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback',
}));

vi.mock('../../../src/util/spotify/pkce', () => ({
	generateCodeVerifier: vi.fn(),
	generateCodeChallenge: vi.fn(),
	generateRandomString: vi.fn(),
}));

vi.mock('../../../src/util/spotify/storage', () => ({
	getStoredToken: vi.fn(),
	setStoredToken: vi.fn(),
	clearStoredToken: vi.fn(),
	clearAuthStorage: vi.fn(),
}));

vi.mock('../../../src/util/spotify/parse', () => ({
	parseJsonResponse: vi.fn(),
}));

import { exchangeCodeForToken,getAccessToken } from '../../../src/util/spotify/auth';
import { STORAGE_KEYS } from '../../../src/util/spotify/config';
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from '../../../src/util/spotify/pkce';
import { getStoredToken, setStoredToken, clearAuthStorage } from '../../../src/util/spotify/storage';
import { parseJsonResponse } from '../../../src/util/spotify/parse';
import { createStorageMock } from './mockHelpers/mockHelpers';

describe('auth utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.stubGlobal('localStorage', createStorageMock());
		vi.stubGlobal('sessionStorage', createStorageMock());
		vi.stubGlobal('fetch', vi.fn());

		vi.mocked(generateCodeVerifier).mockReturnValue('verifier-123');
		vi.mocked(generateCodeChallenge).mockResolvedValue('challenge-abc');
		vi.mocked(generateRandomString).mockReturnValue('state-xyz');
		vi.mocked(getStoredToken).mockReturnValue(null);
		vi.mocked(parseJsonResponse).mockResolvedValue({ ok: true, status: 200, data: null });

		vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		window.history.pushState({}, '', '/');
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('getAccessToken returns cached token when available', async () => {
		vi.mocked(getStoredToken).mockReturnValue('cached-token');

		const token = await getAccessToken();

		expect(token).toBe('cached-token');
	});

	test('getAccessToken handles Spotify callback error by clearing auth state', async () => {
		window.history.pushState({}, '', '/?error=access_denied');

		const token = await getAccessToken();

		expect(token).toBeNull();
		expect(clearAuthStorage).toHaveBeenCalledTimes(1);
		expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, window.location.pathname);
		expect(console.error).toHaveBeenCalledWith('Spotify authorization error:', 'access_denied');
	});

	test('exchangeCodeForToken returns null when PKCE verifier is missing', async () => {
		window.history.pushState({}, '', '/?code=abc&state=state-xyz');
		localStorage.setItem(STORAGE_KEYS.authState, 'state-xyz');

		const token = await exchangeCodeForToken('abc');

		expect(token).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('Missing PKCE code verifier in localStorage.');
	});

	test('exchangeCodeForToken rejects invalid callback state and clears callback params', async () => {
		window.history.pushState({}, '', '/?code=abc&state=wrong-state');
		localStorage.setItem(STORAGE_KEYS.codeVerifier, 'verifier-123');
		localStorage.setItem(STORAGE_KEYS.authState, 'expected-state');

		const token = await exchangeCodeForToken('abc');

		expect(token).toBeNull();
		expect(clearAuthStorage).toHaveBeenCalledTimes(1);
		expect(fetch).not.toHaveBeenCalled();
		expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, window.location.pathname);
	});

	test('exchangeCodeForToken stores token and clears auth storage on successful exchange', async () => {
		window.history.pushState({}, '', '/?code=abc&state=state-xyz');
		localStorage.setItem(STORAGE_KEYS.codeVerifier, 'verifier-123');
		localStorage.setItem(STORAGE_KEYS.authState, 'state-xyz');

		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 });
		vi.mocked(parseJsonResponse).mockResolvedValue({
			ok: true,
			status: 200,
			data: {
				access_token: 'new-access-token',
				expires_in: 3600,
			},
		});

		const token = await exchangeCodeForToken('abc');

		expect(token).toBe('new-access-token');
		expect(fetch).toHaveBeenCalledWith(
			'https://accounts.spotify.test/api/token',
			expect.objectContaining({
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			})
		);

		const fetchOptions = vi.mocked(fetch).mock.calls[0][1];
		const bodyParams = new URLSearchParams(fetchOptions.body);

		expect(bodyParams.get('grant_type')).toBe('authorization_code');
		expect(bodyParams.get('code')).toBe('abc');
		expect(bodyParams.get('client_id')).toBe('test-client-id');
		expect(bodyParams.get('redirect_uri')).toBe('http://127.0.0.1:5173/callback');
		expect(bodyParams.get('code_verifier')).toBe('verifier-123');
		expect(setStoredToken).toHaveBeenCalledWith('new-access-token', 3600);
		expect(clearAuthStorage).toHaveBeenCalledTimes(1);
		expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, window.location.pathname);
	});

});
