import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/app/App';

// Sample track data for testing
const sampleTrack = {
	id: '1',
	name: 'Plug In Baby',
	artist: 'Muse',
	album: 'Origin of Symmetry',
	uri: 'spotify:track:1',
};

// Mock the child components to isolate App component testing
vi.mock('../../src/features/header/Header', () => ({
	default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../src/features/login/Login', () => ({
	default: () => <div data-testid="login">Login</div>,
}));

vi.mock('../../src/features/searchBar/SearchBarContainer', () => ({
	default: ({ onSearch }) => (
		<button type="button" onClick={() => onSearch('Muse')}>
			Trigger Search
		</button>
	),
}));

vi.mock('../../src/features/searchResults/SearchResultsContainer', () => ({
	default: ({ submittedSearchTerm, onAddSelectedTrack }) => (
		<div>
			<div data-testid="submitted-search-term">{submittedSearchTerm}</div>
			<button type="button" onClick={() => onAddSelectedTrack(sampleTrack)}>
				Add Track
			</button>
		</div>
	),
}));

vi.mock('../../src/features/playlist/PlaylistContainer', () => ({
	default: ({ selectedTrack, onClearSelectedTrack }) => (
		<div>
			<div data-testid="selected-track-name">{selectedTrack ? selectedTrack.name : 'none'}</div>
			<button type="button" onClick={onClearSelectedTrack}>
				Clear Track
			</button>
		</div>
	),
}));

// WebPlayerContainer is not directly tested here, so we can mock it as an empty component
vi.mock('../../src/features/webPlayer/WebPlayerContainer', () => ({
	default: () => <div>Web Player</div>,
}));

// Mock Spotify utility to prevent actual API calls during tests
vi.mock('../../src/utils/api_spotify/spotify', () => ({
	AUTH_TOKEN: '/auth/token',
	AUTH_LOGIN: '/auth/login',
	Spotify: {
		playTrack: vi.fn().mockResolvedValue({ ok: true }),
	},
}));

// Now we can write tests for the App component
describe('App', () => {
	beforeEach(() => {
		// Default: simulate an authenticated session by returning ok from the token endpoint
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Test the unauthenticated state
	test('renders login screen when not authenticated', async () => {
		// Override fetch to simulate a failed/missing session
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		render(<App />);

		// After the useEffect fetch resolves with not-ok, isAuthenticated stays false
		await waitFor(() => {
			expect(screen.getByTestId('login')).toBeInTheDocument();
		});
	});

	// Test the authenticated state and interactions

	test('renders key top-level sections', async () => {
		render(<App />);

		// Wait for the useEffect fetch to resolve and the authenticated UI to render
		await waitFor(() => {
			expect(screen.getByTestId('header')).toBeInTheDocument();
		});
		expect(screen.getByRole('button', { name: 'Trigger Search' })).toBeInTheDocument();
		expect(screen.getByTestId('submitted-search-term')).toBeInTheDocument();
		expect(screen.getByTestId('selected-track-name')).toBeInTheDocument();
	});

	test('updates submittedSearchTerm in SearchResultsContainer when search is triggered', async () => {
		render(<App />);

		await waitFor(() => {
			expect(screen.getByTestId('submitted-search-term')).toBeInTheDocument();
		});

		expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('');

		fireEvent.click(screen.getByRole('button', { name: 'Trigger Search' }));

		expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('Muse');
	});

	test('passes selected track to PlaylistContainer when a track is added', async () => {
		render(<App />);

		await waitFor(() => {
			expect(screen.getByTestId('selected-track-name')).toBeInTheDocument();
		});

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');

		fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');
	});

	test('clears selected track when PlaylistContainer requests clear', async () => {
		render(<App />);

		await waitFor(() => {
			expect(screen.getByTestId('selected-track-name')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));
		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');

		fireEvent.click(screen.getByRole('button', { name: 'Clear Track' }));

		expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');
	});
});
