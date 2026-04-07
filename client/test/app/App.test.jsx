import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/app/App';

const sampleTrack = {
	id: '1',
	name: 'Plug In Baby',
	artist: 'Muse',
	album: 'Origin of Symmetry',
	uri: 'spotify:track:1',
};

vi.mock('../../src/features/header/components/Header', () => ({
	default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../src/features/searchBar/containers/SearchBarContainer', () => ({
	default: ({ onSearch }) => (
		<button type="button" onClick={() => onSearch('Muse')}>
			Trigger Search
		</button>
	),
}));

vi.mock('../../src/features/searchResults/container/SearchResultsContainer', () => ({
	default: ({ submittedSearchTerm, onAddSelectedTrack }) => (
		<div>
			<div data-testid="submitted-search-term">{submittedSearchTerm}</div>
			<button type="button" onClick={() => onAddSelectedTrack(sampleTrack)}>
				Add Track
			</button>
		</div>
	),
}));

vi.mock('../../src/features/playlist/container/PlaylistContainer', () => ({
	default: ({ selectedTrack, onClearSelectedTrack }) => (
		<div>
			<div data-testid="selected-track-name">{selectedTrack ? selectedTrack.name : 'none'}</div>
			<button type="button" onClick={onClearSelectedTrack}>
				Clear Track
			</button>
		</div>
	),
}));

describe('App', () => {
	test('renders key top-level sections', () => {
		render(<App />);

		expect(screen.getByTestId('header')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Trigger Search' })).toBeInTheDocument();
		expect(screen.getByTestId('submitted-search-term')).toBeInTheDocument();
		expect(screen.getByTestId('selected-track-name')).toBeInTheDocument();
	});

	test('updates submittedSearchTerm in SearchResultsContainer when search is triggered', () => {
		render(<App />);

		expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('');

		fireEvent.click(screen.getByRole('button', { name: 'Trigger Search' }));

		expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('Muse');
	});

	test('passes selected track to PlaylistContainer when a track is added', () => {
		render(<App />);

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');

		fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');
	});

	test('clears selected track when PlaylistContainer requests clear', () => {
		render(<App />);

		fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));
		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');

		fireEvent.click(screen.getByRole('button', { name: 'Clear Track' }));

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');
	});
});
