import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchResults from '../../../src/features/searchResults/components/SearchResults';

vi.mock('../../../src/features/tracklist/containers/TracklistContainer', () => ({
	default: ({ tracklist, listType, onAddSelectedTrack }) => (
		<div
			data-testid="tracklist-container"
			data-track-count={tracklist.length}
			data-list-type={listType}
			data-on-add-type={typeof onAddSelectedTrack}
		/>
	),
}));

describe('SearchResults', () => {
	test('renders the section title', () => {
		render(<SearchResults searchResults={[]} onAddSelectedTrack={() => {}} />);

		expect(screen.getByRole('heading', { name: /search results/i })).toBeInTheDocument();
	});

	test('shows an empty-state message when there are no search results', () => {
		render(<SearchResults searchResults={[]} onAddSelectedTrack={() => {}} />);

		expect(
			screen.getByText('No search results found. Please try a different search term.')
		).toBeInTheDocument();
		expect(screen.queryByTestId('tracklist-container')).not.toBeInTheDocument();
	});

	test('renders TracklistContainer when search results are available and passes expected props', () => {
		const onAddSelectedTrack = vi.fn();
		const results = [
			{
				id: '1',
				name: 'Starlight',
				artist: 'Muse',
				album: 'Black Holes and Revelations',
				image: 'starlight.jpg',
				uri: 'spotify:track:1',
			},
			{
				id: '2',
				name: 'Time Is Running Out',
				artist: 'Muse',
				album: 'Absolution',
				image: 'time.jpg',
				uri: 'spotify:track:2',
			},
		];

		render(
			<SearchResults
				searchResults={results}
				onAddSelectedTrack={onAddSelectedTrack}
			/>
		);

		const tracklistContainer = screen.getByTestId('tracklist-container');
		expect(tracklistContainer).toBeInTheDocument();
		expect(tracklistContainer).toHaveAttribute('data-track-count', '2');
		expect(tracklistContainer).toHaveAttribute('data-list-type', 'searchResults');
		expect(tracklistContainer).toHaveAttribute('data-on-add-type', 'function');
		expect(
			screen.queryByText('No search results found. Please try a different search term.')
		).not.toBeInTheDocument();
	});
});
