import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/app/App';
import { sampleAppTrack } from '../setup/fixtures';

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
            <button type="button" onClick={() => onAddSelectedTrack(sampleAppTrack)}>
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

vi.mock('../../src/features/webPlayer/WebPlayerContainer', () => ({
    default: () => <div>Web Player</div>,
}));

vi.mock('../../src/utils/api_spotify/spotify', () => ({
    AUTH_TOKEN: '/auth/token',
    AUTH_LOGIN: '/auth/login',
    Spotify: {
        playTrack: vi.fn().mockResolvedValue({ ok: true }),
    },
}));

const renderApp = async ({ authenticated = true } = {}) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: authenticated }));
    render(<App />);

    if (authenticated) {
        await screen.findByTestId('header');
    } else {
        await screen.findByTestId('login');
    }
};

describe('App', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('renders login screen when not authenticated', async () => {
        await renderApp({ authenticated: false });

        expect(screen.getByTestId('login')).toBeInTheDocument();
    });

    test('renders key top-level sections', async () => {
        await renderApp();

        expect(screen.getByRole('button', { name: 'Trigger Search' })).toBeInTheDocument();
        expect(screen.getByTestId('submitted-search-term')).toBeInTheDocument();
        expect(screen.getByTestId('selected-track-name')).toBeInTheDocument();
    });

    test('updates submittedSearchTerm in SearchResultsContainer when search is triggered', async () => {
        await renderApp();

        expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('');

        fireEvent.click(screen.getByRole('button', { name: 'Trigger Search' }));

        expect(screen.getByTestId('submitted-search-term')).toHaveTextContent('Muse');
    });

    test('passes selected track to PlaylistContainer when a track is added', async () => {
        await renderApp();

        expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');

        fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));

        expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');
    });

    test('clears selected track when PlaylistContainer requests clear', async () => {
        await renderApp();

        fireEvent.click(screen.getByRole('button', { name: 'Add Track' }));
        expect(screen.getByTestId('selected-track-name')).toHaveTextContent('Plug In Baby');

        fireEvent.click(screen.getByRole('button', { name: 'Clear Track' }));

        expect(screen.getByTestId('selected-track-name')).toHaveTextContent('none');
    });
});
