import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Track from '../../../src/features/track/Track';
import testImg from '../../assets/images/test_album_img.jpeg';

describe('Track', () => {
    let onAddSelectedTrack;
    let onRemovePlaylistTrack;
    let onPlayTrack;

    const baseTrack = {
        id: '1',
        name: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        image: testImg,
        uri: 'spotify:track:12345',
    };

    beforeEach(() => {
        onAddSelectedTrack = vi.fn();
        onRemovePlaylistTrack = vi.fn();
        onPlayTrack = vi.fn();
    });

    test('displays the track name, artist, album, and album cover image.', () => {
        render(
            <Track
                track={baseTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        expect(screen.getByText('Test Track')).toBeInTheDocument();
        expect(screen.getByText('Test Artist • Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', testImg);
    });

    test('renders a play button and add button for search results and does not render a remove button', () => {
        render(
            <Track
                track={baseTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        expect(
            screen.getByRole('button', { name: /play test track/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /add test track to playlist/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /remove test track from playlist/i })
        ).not.toBeInTheDocument();
    });

    test('renders a remove button for playlist tracks and does not render a play button or add button', () => {
        render(
            <Track
                track={baseTrack}
                listType="playlistTracks"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        expect(
            screen.getByRole('button', { name: /remove test track from playlist/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /play test track/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /add test track to playlist/i })
        ).not.toBeInTheDocument();
    });

    test('calls onAddSelectedTrack with the track data when the add button is clicked', () => {
        render(
            <Track
                track={baseTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        fireEvent.click(
            screen.getByRole('button', { name: /add test track to playlist/i })
        );

        expect(onAddSelectedTrack).toHaveBeenCalledTimes(1);
        expect(onAddSelectedTrack).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                name: 'Test Track',
                artist: 'Test Artist',
                album: 'Test Album',
                image: testImg,
                uri: 'spotify:track:12345',
            })
        );
    });

    test('calls onRemovePlaylistTrack with the track data when the remove button is clicked', () => {
        render(
            <Track
                track={baseTrack}
                listType="playlistTracks"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        fireEvent.click(
            screen.getByRole('button', { name: /remove test track from playlist/i })
        );

        expect(onRemovePlaylistTrack).toHaveBeenCalledTimes(1);
        expect(onRemovePlaylistTrack).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                name: 'Test Track',
                artist: 'Test Artist',
                album: 'Test Album',
                image: testImg,
                uri: 'spotify:track:12345',
            })
        );
    });

    test('calls onPlayTrack with the track uri when the play button is clicked', () => {
        render(
            <Track
                track={baseTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
                onPlayTrack={onPlayTrack}
            />
        );

        fireEvent.click(
            screen.getByRole('button', { name: /play test track/i })
        );

        expect(onPlayTrack).toHaveBeenCalledTimes(1);
        expect(onPlayTrack).toHaveBeenCalledWith('spotify:track:12345');
    });
});
