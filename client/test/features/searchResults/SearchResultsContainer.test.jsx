import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SearchResultsContainer from '../../../src/features/searchResults/container/SearchResultsContainer';

const { spotifySearchMock } = vi.hoisted(() => ({
	spotifySearchMock: vi.fn(),
}));

vi.mock('../../../src/util/spotify/index', () => ({
	Spotify: {
		search: spotifySearchMock,
	},
}));

vi.mock('../../../src/features/searchResults/components/SearchResults', () => ({
	default: ({ searchResults, listType, onAddSelectedTrack }) => (
		<div
			data-testid="search-results"
			data-track-count={searchResults.length}
			data-list-type={listType}
			data-on-add-type={typeof onAddSelectedTrack}
		/>
	),
}));

describe('SearchResultsContainer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('does not call Spotify.search and renders empty results when submittedSearchTerm is empty', async () => {
		render(
			<SearchResultsContainer
				submittedSearchTerm=""
				onAddSelectedTrack={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('search-results')).toHaveAttribute('data-track-count', '0');
		});

		expect(spotifySearchMock).not.toHaveBeenCalled();
	});

	test('calls Spotify.search with submittedSearchTerm and passes returned tracks to SearchResults', async () => {
		const onAddSelectedTrack = vi.fn();
		spotifySearchMock.mockResolvedValue({
			tracks: [
				{ id: '1', name: 'Hysteria' },
				{ id: '2', name: 'Uprising' },
			],
		});

		render(
			<SearchResultsContainer
				submittedSearchTerm="Muse"
				onAddSelectedTrack={onAddSelectedTrack}
			/>
		);

		await waitFor(() => {
			expect(spotifySearchMock).toHaveBeenCalledWith('Muse');
		});

		await waitFor(() => {
			const searchResults = screen.getByTestId('search-results');
			expect(searchResults).toHaveAttribute('data-track-count', '2');
			expect(searchResults).toHaveAttribute('data-list-type', 'searchResults');
			expect(searchResults).toHaveAttribute('data-on-add-type', 'function');
		});
	});

	test('falls back to an empty results array when Spotify response has no tracks', async () => {
		spotifySearchMock.mockResolvedValue({});

		render(
			<SearchResultsContainer
				submittedSearchTerm="NoTrackPayload"
				onAddSelectedTrack={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('search-results')).toHaveAttribute('data-track-count', '0');
		});
	});

	test('resets displayed results when submittedSearchTerm changes from a value to empty', async () => {
		spotifySearchMock.mockResolvedValue({
			tracks: [{ id: '1', name: 'Supermassive Black Hole' }],
		});

		const { rerender } = render(
			<SearchResultsContainer
				submittedSearchTerm="Muse"
				onAddSelectedTrack={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('search-results')).toHaveAttribute('data-track-count', '1');
		});

		rerender(
			<SearchResultsContainer
				submittedSearchTerm=""
				onAddSelectedTrack={() => {}}
			/>
		);

		await waitFor(() => {
			expect(screen.getByTestId('search-results')).toHaveAttribute('data-track-count', '0');
		});

		expect(spotifySearchMock).toHaveBeenCalledTimes(1);
	});
});
