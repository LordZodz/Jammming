import { describe, test, expect, vi, afterEach } from 'vitest';
import { generateRandomString, generateCodeVerifier, generateCodeChallenge } from '../../../src/util/spotify/pkce';

describe('pkce utilities', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('generateRandomString uses only PKCE-safe characters and returns requested length', () => {
		const value = generateRandomString(80);

		expect(value).toHaveLength(80);
		expect(value).toMatch(/^[A-Za-z0-9\-._~]+$/);
	});

	test('generateRandomString defaults to length 64', () => {
		const value = generateRandomString();

		expect(value).toHaveLength(64);
	});

	test('generateRandomString calls crypto.getRandomValues with a Uint8Array of matching length', () => {
		const getRandomValuesSpy = vi
			.spyOn(globalThis.crypto, 'getRandomValues')
			.mockImplementation((typedArray) => {
				typedArray.fill(0);
				return typedArray;
			});

		const value = generateRandomString(10);

		expect(getRandomValuesSpy).toHaveBeenCalledTimes(1);
		expect(getRandomValuesSpy).toHaveBeenCalledWith(expect.any(Uint8Array));
		expect(getRandomValuesSpy.mock.calls[0][0]).toHaveLength(10);
		expect(value).toBe('AAAAAAAAAA');
	});

	test('generateCodeVerifier defaults to length 128', () => {
		const verifier = generateCodeVerifier();

		expect(verifier).toHaveLength(128);
		expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
	});

	test('generateCodeVerifier supports custom lengths', () => {
		const verifier = generateCodeVerifier(96);

		expect(verifier).toHaveLength(96);
	});

	test('generateCodeChallenge returns RFC 7636 compatible output for known verifier', async () => {
		const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

		const challenge = await generateCodeChallenge(verifier);

		expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
	});

	test('generateCodeChallenge returns base64url output with no padding', async () => {
		const challenge = await generateCodeChallenge('test-verifier-value');

		expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(challenge).not.toContain('=');
	});
});
