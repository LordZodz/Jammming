import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../src/util/spotify/auth', () => ({
	getAccessToken: vi.fn(),
}));

vi.mock('../../../src/util/spotify/parse', () => ({
	parseJsonResponse: vi.fn(),
}));

import { fetchWithAccessToken, search, savePlaylist } from '../../../src/util/spotify/api';
import { getAccessToken } from '../../../src/util/spotify/auth';
import { parseJsonResponse } from '../../../src/util/spotify/parse';

describe('spotify api utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('fetch', vi.fn());
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(getAccessToken).mockResolvedValue('test-token');
		vi.mocked(parseJsonResponse).mockResolvedValue({ ok: true, status: 200, data: {} });
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('fetchWithAccessToken returns error when no access token is available', async () => {
		vi.mocked(getAccessToken).mockResolvedValue(null);

		const result = await fetchWithAccessToken('https://api.spotify.com/v1/search');

		expect(result).toEqual({ ok: false, error: 'No access token available' });
		expect(fetch).not.toHaveBeenCalled();
	});

	test('fetchWithAccessToken sends authorization header and returns parsed response', async () => {
		const mockResponse = { ok: true, status: 200 };
		vi.mocked(fetch).mockResolvedValue(mockResponse);
		vi.mocked(parseJsonResponse).mockResolvedValue({
			ok: true,
			status: 200,
			data: { items: [] },
		});

		const result = await fetchWithAccessToken('https://api.spotify.com/v1/search', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		expect(fetch).toHaveBeenCalledWith(
			'https://api.spotify.com/v1/search',
			expect.objectContaining({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-token',
				},
			})
		);
		expect(parseJsonResponse).toHaveBeenCalledWith(mockResponse);
		expect(result).toEqual({ ok: true, status: 200, data: { items: [] } });
	});

	test('search rejects blank queries', async () => {
		const result = await search('   ');

		expect(result).toEqual({
			ok: false,
			error: 'Search query is required',
			tracks: [],
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	test('search maps Spotify track items to simplified track objects', async () => {
		const apiData = {
			tracks: {
				items: [
					{
						id: '1',
						name: 'Track Name',
						artists: [{ name: 'Artist Name' }],
						album: {
							name: 'Album Name',
							images: [{ url: 'https://image.test/cover.jpg' }],
						},
						uri: 'spotify:track:1',
					},
				],
			},
		};

		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 });
		vi.mocked(parseJsonResponse).mockResolvedValue({ ok: true, status: 200, data: apiData });

		const result = await search('  test query  ');

		expect(fetch).toHaveBeenCalledWith(
			'https://api.spotify.com/v1/search?type=track&q=test+query',
			expect.objectContaining({ method: 'GET' })
		);
		expect(result).toEqual({
			ok: true,
			tracks: [
				{
					id: '1',
					name: 'Track Name',
					artist: 'Artist Name',
					album: 'Album Name',
					image: 'https://image.test/cover.jpg',
					uri: 'spotify:track:1',
				},
			],
		});
	});

	test('search returns API error details when Spotify search fails', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 });
		vi.mocked(parseJsonResponse).mockResolvedValue({
			ok: false,
			status: 401,
			data: { error: { message: 'Invalid access token' } },
		});

		const result = await search('rock');

		expect(result).toEqual({
			ok: false,
			error: 'Invalid access token',
			tracks: [],
		});
	});

	test('savePlaylist validates required playlist name', async () => {
		const result = await savePlaylist('   ', ['spotify:track:1']);

		expect(result).toEqual({ ok: false, error: 'Playlist name is required.' });
		expect(fetch).not.toHaveBeenCalled();
	});

	test('savePlaylist validates track URIs', async () => {
		const result = await savePlaylist('My Playlist', []);

		expect(result).toEqual({ ok: false, error: 'At least one track URI is required.' });
		expect(fetch).not.toHaveBeenCalled();
	});

	test('savePlaylist creates playlist and adds tracks when requests succeed', async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true, status: 201 })
			.mockResolvedValueOnce({ ok: true, status: 201 });
		vi.mocked(parseJsonResponse)
			.mockResolvedValueOnce({
				ok: true,
				status: 201,
				data: { id: 'playlist-123' },
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 201,
				data: { snapshot_id: 'snapshot-789' },
			});

		const result = await savePlaylist('  Chill Mix  ', [
			'spotify:track:1',
			'',
			null,
			'spotify:track:2',
		]);

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(fetch).toHaveBeenNthCalledWith(
			1,
			'https://api.spotify.com/v1/me/playlists',
			expect.objectContaining({ method: 'POST' })
		);
		expect(fetch).toHaveBeenNthCalledWith(
			2,
			'https://api.spotify.com/v1/playlists/playlist-123/items',
			expect.objectContaining({ method: 'POST' })
		);

		const createBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1].body);
		const addTracksBody = JSON.parse(vi.mocked(fetch).mock.calls[1][1].body);

		expect(createBody).toEqual({ name: 'Chill Mix', public: false });
		expect(addTracksBody).toEqual({ uris: ['spotify:track:1', 'spotify:track:2'] });
		expect(result).toEqual({
			ok: true,
			playlistId: 'playlist-123',
			snapshotId: 'snapshot-789',
		});
	});

	test('savePlaylist returns error when adding tracks fails', async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce({ ok: true, status: 201 })
			.mockResolvedValueOnce({ ok: false, status: 400 });
		vi.mocked(parseJsonResponse)
			.mockResolvedValueOnce({
				ok: true,
				status: 201,
				data: { id: 'playlist-123' },
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 400,
				data: { error: { message: 'Bad tracks payload' } },
			});

		const result = await savePlaylist('Road Trip', ['spotify:track:1']);

		expect(result).toEqual({
			ok: false,
			error: 'Bad tracks payload',
		});
	});
});
