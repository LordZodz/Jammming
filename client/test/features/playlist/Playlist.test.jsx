import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Playlist from '../../../src/features/playlist/components/Playlist';

describe('Playlist', () => {
    let onUpdatePlaylistName;
    let onRemovePlaylistTrack;
    let onSubmitPlaylist;

    const mockTrack = {
        id: '1',
        name: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        image: 'test-image.jpg',
        uri: 'spotify:track:1',
    };

    const baseProps = {
        playlistName: 'My Playlist',
        onUpdatePlaylistName: () => {},
        playlistTracks: [],
        listType: 'playlistTracks',
        onRemovePlaylistTrack: () => {},
        onSubmitPlaylist: () => {},
    };

    beforeEach(() => {
        onUpdatePlaylistName = vi.fn();
        onRemovePlaylistTrack = vi.fn();
        onSubmitPlaylist = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders playlist name input with current value', () => {
        render(
            <Playlist
                {...baseProps}
                playlistName="Summer Hits"
                onUpdatePlaylistName={onUpdatePlaylistName}
            />
        );

        const input = screen.getByPlaceholderText('Type playlist name');
        expect(input).toHaveValue('Summer Hits');
    });

    test('calls onUpdatePlaylistName when playlist name input changes', () => {
        render(
            <Playlist
                {...baseProps}
                onUpdatePlaylistName={onUpdatePlaylistName}
            />
        );

        const input = screen.getByPlaceholderText('Type playlist name');
        fireEvent.change(input, { target: { value: 'New Playlist Name' } });

        expect(onUpdatePlaylistName).toHaveBeenCalledTimes(1);
        expect(onUpdatePlaylistName).toHaveBeenCalledWith('New Playlist Name');
    });

    test('renders "No tracks" message when playlist is empty', () => {
        render(
            <Playlist
                {...baseProps}
                playlistTracks={[]}
                onUpdatePlaylistName={onUpdatePlaylistName}
            />
        );

        expect(
            screen.getByText('No tracks in playlist. Please add some tracks from the search results.')
        ).toBeInTheDocument();
    });

    test('does not render "No tracks" message when playlist has tracks', () => {
        render(
            <Playlist
                {...baseProps}
                playlistTracks={[mockTrack]}
                onUpdatePlaylistName={onUpdatePlaylistName}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        expect(
            screen.queryByText('No tracks in playlist. Please add some tracks from the search results.')
        ).not.toBeInTheDocument();
    });

    test('"Save to Spotify" button is disabled when playlist is empty', () => {
        render(
            <Playlist
                {...baseProps}
                playlistTracks={[]}
                onUpdatePlaylistName={onUpdatePlaylistName}
                onSubmitPlaylist={onSubmitPlaylist}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save playlist/i });
        expect(saveButton).toBeDisabled();
    });

    test('"Save to Spotify" button is enabled when playlist has tracks', () => {
        render(
            <Playlist
                {...baseProps}
                playlistTracks={[mockTrack]}
                onUpdatePlaylistName={onUpdatePlaylistName}
                onSubmitPlaylist={onSubmitPlaylist}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save playlist/i });
        expect(saveButton).not.toBeDisabled();
    });

    test('calls onSubmitPlaylist when save button is clicked', () => {
        render(
            <Playlist
                {...baseProps}
                playlistTracks={[mockTrack]}
                onUpdatePlaylistName={onUpdatePlaylistName}
                onSubmitPlaylist={onSubmitPlaylist}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save playlist/i });
        fireEvent.click(saveButton);

        expect(onSubmitPlaylist).toHaveBeenCalledTimes(1);
    });
});

