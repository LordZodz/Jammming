import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaylistContainer from '../../../src/features/playlist/PlaylistContainer';

vi.mock('../../../src/utils/api_spotify/spotify', () => ({
	Spotify: {
		savePlaylist: vi.fn(),
	},
}));

import { Spotify } from '../../../src/utils/api_spotify/spotify';

describe('PlaylistContainer', () => {
	let onClearSelectedTrack;

	const sampleTrack = {
		id: '1',
		name: 'Test Track',
		artist: 'Test Artist',
		album: 'Test Album',
		image: 'test_image.jpg',
		uri: 'spotify:track:1',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		onClearSelectedTrack = vi.fn();
		vi.stubGlobal('alert', vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('renders empty playlist state initially', () => {
		render(
			<PlaylistContainer
				selectedTrack={null}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		expect(
			screen.getByText('No tracks in playlist. Please add some tracks from the search results.')
		).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /save playlist/i })).toBeDisabled();
	});

	test('adds selected track and calls onClearSelectedTrack', async () => {
		render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		expect(await screen.findByText('Test Track')).toBeInTheDocument();
		expect(onClearSelectedTrack).toHaveBeenCalledTimes(1);
		expect(screen.getByRole('button', { name: /save playlist/i })).not.toBeDisabled();
	});

	test('does not add duplicate tracks when same selected track is provided again', async () => {
		const { rerender } = render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		expect(await screen.findByText('Test Track')).toBeInTheDocument();

		rerender(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		expect(screen.getAllByText('Test Track')).toHaveLength(1);
	});

	test('removes a track when its remove button is clicked', async () => {
		render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		const removeButton = await screen.findByRole('button', {
			name: /remove test track from playlist/i,
		});
		fireEvent.click(removeButton);

		await waitFor(() => {
			expect(
				screen.getByText('No tracks in playlist. Please add some tracks from the search results.')
			).toBeInTheDocument();
		});
	});

	test('alerts and skips save when playlist name is missing', async () => {
		render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		const saveButton = await screen.findByRole('button', { name: /save playlist/i });
		fireEvent.click(saveButton);

		expect(alert).toHaveBeenCalledWith(
			'Please enter a playlist name and add at least one track before submitting.'
		);
		expect(Spotify.savePlaylist).not.toHaveBeenCalled();
	});

	test('saves playlist and clears state on successful response', async () => {
		vi.mocked(Spotify.savePlaylist).mockResolvedValue({ ok: true });

		render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Type playlist name'), {
			target: { value: 'Road Trip' },
		});

		fireEvent.click(screen.getByRole('button', { name: /save playlist/i }));

		await waitFor(() => {
			expect(Spotify.savePlaylist).toHaveBeenCalledWith('Road Trip', ['spotify:track:1']);
		});
		expect(alert).toHaveBeenCalledWith('Playlist saved successfully!');

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Type playlist name')).toHaveValue('');
			expect(
				screen.getByText('No tracks in playlist. Please add some tracks from the search results.')
			).toBeInTheDocument();
		});
	});

	test('shows failure alert when savePlaylist returns not ok', async () => {
		vi.mocked(Spotify.savePlaylist).mockResolvedValue({ ok: false });

		render(
			<PlaylistContainer
				selectedTrack={sampleTrack}
				onClearSelectedTrack={onClearSelectedTrack}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Type playlist name'), {
			target: { value: 'Road Trip' },
		});

		fireEvent.click(screen.getByRole('button', { name: /save playlist/i }));

		await waitFor(() => {
			expect(Spotify.savePlaylist).toHaveBeenCalledWith('Road Trip', ['spotify:track:1']);
		});
		expect(alert).toHaveBeenCalledWith('There was an error saving your playlist. Please try again.');
		expect(screen.getByPlaceholderText('Type playlist name')).toHaveValue('Road Trip');
	});
});

