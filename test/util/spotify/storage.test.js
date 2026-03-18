import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredToken, setStoredToken, clearStoredToken, clearAuthStorage } from '../../../src/util/spotify/storage';
import { STORAGE_KEYS } from '../../../src/util/spotify/config';
import { createStorageMock } from './mockHelpers/mockHelpers';

describe('storage utilities', () => {
	beforeEach(() => {
		vi.stubGlobal('sessionStorage', createStorageMock());
		vi.stubGlobal('localStorage', createStorageMock());
		clearStoredToken();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('setStoredToken saves token and expiry in sessionStorage', () => {
		vi.spyOn(Date, 'now').mockReturnValue(1_000_000);

		setStoredToken('abc123', 3600);

		expect(sessionStorage.getItem(STORAGE_KEYS.accessToken)).toBe('abc123');
		expect(sessionStorage.getItem(STORAGE_KEYS.expiresAt)).toBe(String(4_600_000));
	});

	test('getStoredToken returns token from memory when still valid', () => {
		vi.spyOn(Date, 'now').mockReturnValue(2_000_000);
		setStoredToken('memory-token', 60);

		const token = getStoredToken();

		expect(token).toBe('memory-token');
	});

	test('getStoredToken hydrates from sessionStorage when memory cache is empty', () => {
		vi.spyOn(Date, 'now').mockReturnValue(3_000_000);
		sessionStorage.setItem(STORAGE_KEYS.accessToken, 'stored-token');
		sessionStorage.setItem(STORAGE_KEYS.expiresAt, String(3_050_000));

		const token = getStoredToken();

		expect(token).toBe('stored-token');
	});

	test('getStoredToken clears stale storage and returns null when token expired', () => {
		vi.spyOn(Date, 'now').mockReturnValue(4_000_000);
		sessionStorage.setItem(STORAGE_KEYS.accessToken, 'expired-token');
		sessionStorage.setItem(STORAGE_KEYS.expiresAt, String(3_999_999));

		const token = getStoredToken();

		expect(token).toBeNull();
		expect(sessionStorage.getItem(STORAGE_KEYS.accessToken)).toBeNull();
		expect(sessionStorage.getItem(STORAGE_KEYS.expiresAt)).toBeNull();
	});

	test('clearStoredToken removes token data from memory and sessionStorage', () => {
		vi.spyOn(Date, 'now').mockReturnValue(5_000_000);
		setStoredToken('to-clear', 60);

		clearStoredToken();

		expect(getStoredToken()).toBeNull();
		expect(sessionStorage.getItem(STORAGE_KEYS.accessToken)).toBeNull();
		expect(sessionStorage.getItem(STORAGE_KEYS.expiresAt)).toBeNull();
	});

	test('clearAuthStorage removes code verifier and auth state from localStorage', () => {
		localStorage.setItem(STORAGE_KEYS.codeVerifier, 'verifier-value');
		localStorage.setItem(STORAGE_KEYS.authState, 'state-value');

		clearAuthStorage();

		expect(localStorage.getItem(STORAGE_KEYS.codeVerifier)).toBeNull();
		expect(localStorage.getItem(STORAGE_KEYS.authState)).toBeNull();
	});
});
