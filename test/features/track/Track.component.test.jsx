import { test, expect, describe, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Track from '../../../src/features/track/components/Track';
import testImg from '../../assets/images/test_album_img.jpeg';

// Base props for the Track component tests, providing default values for all required props.
const baseProps = {
    id: '1',
    name: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    image: testImg,
    listType: 'searchResults',
    onAddSelectedTrack: vi.fn(),
    onRemovePlaylistTrack: vi.fn()
};

/**
 * Test suite for the Track component, which is responsible for displaying individual track information and providing functionality to add or remove tracks from a playlist.
 * The tests cover rendering of track information, conditional rendering of add/remove buttons based on the list type, and the functionality of these buttons when clicked.
 */
describe('Track Component', () => {
    test('displays track information correctly', () => {
        render(<Track {...baseProps} />);

        expect(screen.getByText('Test Track')).toBeInTheDocument();
        expect(screen.getByText('Test Artist • Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', testImg);
    });

    test('renders add button for search results list type', () => {
        render(<Track {...baseProps} listType="searchResults" />);

        expect(
            screen.getByRole('button', { name: /add test track to playlist/i })
        ).toBeInTheDocument();
    });

    test('renders remove button for playlist tracks list type', () => {
        render(<Track {...baseProps} listType="playlistTracks" />);

        expect(
            screen.getByRole('button', { name: /remove test track from playlist/i })
        ).toBeInTheDocument();
    });

    test('calls onAddSelectedTrack when add button is clicked', () => {
        const onAddSelectedTrackMock = vi.fn();

        render(
            <Track
                {...baseProps}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrackMock}
            />
        );

        const addButton = screen.getByRole('button', {
            name: /add test track to playlist/i
        });

        fireEvent.click(addButton);

        expect(onAddSelectedTrackMock).toHaveBeenCalledTimes(1);
        expect(onAddSelectedTrackMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                name: 'Test Track',
                artist: 'Test Artist',
                album: 'Test Album',
                image: testImg,
                listType: 'searchResults'
            })
        );
    });

    test('calls onRemovePlaylistTrack when remove button is clicked', () => {
        const onRemovePlaylistTrackMock = vi.fn();

        render(
            <Track
                {...baseProps}
                listType="playlistTracks"
                onRemovePlaylistTrack={onRemovePlaylistTrackMock}
            />
        );

        const removeButton = screen.getByRole('button', {
            name: /remove test track from playlist/i
        });

        fireEvent.click(removeButton);

        expect(onRemovePlaylistTrackMock).toHaveBeenCalledTimes(1);
        expect(onRemovePlaylistTrackMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                name: 'Test Track',
                artist: 'Test Artist',
                album: 'Test Album',
                image: testImg,
                listType: 'playlistTracks'
            })
        );
    });
});
