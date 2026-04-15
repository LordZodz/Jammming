import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import { search, savePlaylist, playTrack, setRepeat } from '../../../src/utils/api_spotify/api';

const SERVER_URL = 'http://127.0.0.1:3000';

// Helper to create a mock fetch response with a .json() method,
// since parseJsonResponse is internal to api.js and calls response.json()
const mockFetchResponse = (ok, status, data) => ({
	ok,
	status,
	json: vi.fn().mockResolvedValue(data),
});

describe('spotify api utilities', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	// -------------------------
	// search
	// -------------------------

	test('search rejects blank queries', async () => {
		const result = await search('   ');

		expect(result).toEqual({
			ok: false,
			error: 'Search query is required',
			tracks: [],
		});
		expect(fetch).not.toHaveBeenCalled();
	});

	test('search sends request to server search endpoint with trimmed query', async () => {
		const apiData = { tracks: { items: [] } };
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, apiData));

		await search('  test query  ');

		expect(fetch).toHaveBeenCalledWith(
			`${SERVER_URL}/api/search/searchQuery?q=test+query`,
			expect.objectContaining({ credentials: 'include' })
		);
	});

	test('search maps server track items to simplified track objects', async () => {
		const apiData = {
			tracks: {
				items: [
					{
						id: '1',
						explicit: false,
						name: 'Track Name',
						artists: [{ name: 'Artist Name' }],
						album: {
							name: 'Album Name',
							images: [{ url: 'https://image.test/cover.jpg' }],
						},
						duration: '',
						uri: 'spotify:track:1',
					},
				],
			},
		};
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, apiData));

		const result = await search('test query');

		expect(result).toEqual({
			ok: true,
			tracks: [
				{
					id: '1',
					explicit: false,
					name: 'Track Name',
					artist: 'Artist Name',
					album: 'Album Name',
					image: 'https://image.test/cover.jpg',
					duration: '',
					uri: 'spotify:track:1',
				},
			],
		});
	});

	test('search returns error when server search request fails', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(false, 401, { error: { message: 'Unauthorized' } })
		);

		const result = await search('rock');

		expect(result).toEqual({
			ok: false,
			error: 'Unauthorized',
			tracks: [],
		});
	});

	test('search returns error when response has invalid track structure', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(true, 200, { unexpected: true }));

		const result = await search('jazz');

		expect(result).toEqual({
			ok: false,
			error: 'Invalid response from Spotify API.',
			tracks: [],
		});
	});

	// -------------------------
	// savePlaylist
	// -------------------------

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
			.mockResolvedValueOnce(mockFetchResponse(true, 201, { id: 'playlist-123' }))
			.mockResolvedValueOnce(mockFetchResponse(true, 201, { snapshot_id: 'snapshot-789' }));

		const result = await savePlaylist('  Chill Mix  ', [
			'spotify:track:1',
			'',
			null,
			'spotify:track:2',
		]);

		expect(fetch).toHaveBeenCalledTimes(2);
		expect(fetch).toHaveBeenNthCalledWith(
			1,
			`${SERVER_URL}/api/me/playlists/createPlaylist`,
			expect.objectContaining({ method: 'POST', credentials: 'include' })
		);
		expect(fetch).toHaveBeenNthCalledWith(
			2,
			`${SERVER_URL}/api/playlists/playlist-123/addTracksToPlaylist`,
			expect.objectContaining({ method: 'POST', credentials: 'include' })
		);

		const createBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1].body);
		const addTracksBody = JSON.parse(vi.mocked(fetch).mock.calls[1][1].body);

		expect(createBody).toEqual({ name: 'Chill Mix', public: false });
		// empty string and null URIs should be filtered out
		expect(addTracksBody).toEqual({ uris: ['spotify:track:1', 'spotify:track:2'] });
		expect(result).toEqual({
			ok: true,
			playlistId: 'playlist-123',
			snapshotId: 'snapshot-789',
		});
	});

	test('savePlaylist returns error when create playlist request fails', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			mockFetchResponse(false, 403, { error: { message: 'Forbidden' } })
		);

		const result = await savePlaylist('Road Trip', ['spotify:track:1']);

		expect(result).toEqual({ ok: false, error: 'Forbidden' });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test('savePlaylist returns error when adding tracks fails', async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce(mockFetchResponse(true, 201, { id: 'playlist-123' }))
			.mockResolvedValueOnce(
				mockFetchResponse(false, 400, { error: { message: 'Bad tracks payload' } })
			);

		const result = await savePlaylist('Road Trip', ['spotify:track:1']);

		expect(result).toEqual({ ok: false, error: 'Bad tracks payload' });
	});

	// -------------------------
	// playTrack
	// -------------------------

	test('playTrack sends PUT request to server player endpoint with deviceId and uri', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 });

		await playTrack('device-abc', 'spotify:track:1');

		expect(fetch).toHaveBeenCalledWith(
			`${SERVER_URL}/api/player/play`,
			expect.objectContaining({
				method: 'PUT',
				credentials: 'include',
				body: JSON.stringify({ deviceId: 'device-abc', uri: 'spotify:track:1' }),
			})
		);
	});

	test('playTrack returns ok:true on 204 No Content response', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 });

		const result = await playTrack('device-abc', 'spotify:track:1');

		expect(result).toEqual({ ok: true });
	});

	test('playTrack returns error when playback request fails', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(false, 404, { error: { message: 'Device not found' } })
		);

		const result = await playTrack('bad-device', 'spotify:track:1');

		expect(result).toEqual({ ok: false, error: 'Device not found' });
	});

	// -------------------------
	// setRepeat
	// -------------------------

	test('setRepeat sends PUT request to server player repeat endpoint with state', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 });

		await setRepeat('track');

		expect(fetch).toHaveBeenCalledWith(
			`${SERVER_URL}/api/player/repeat`,
			expect.objectContaining({
				method: 'PUT',
				credentials: 'include',
				body: JSON.stringify({ state: 'track' }),
			})
		);
	});

	test('setRepeat returns ok:true on 204 No Content response', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 });

		const result = await setRepeat('off');

		expect(result).toEqual({ ok: true });
	});

	test('setRepeat returns error when repeat request fails', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(false, 403, { error: { message: 'Premium required' } })
		);

		const result = await setRepeat('context');

		expect(result).toEqual({ ok: false, error: 'Premium required' });
	});
});
