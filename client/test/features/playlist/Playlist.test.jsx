import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Playlist from '../../../src/features/playlist/Playlist';

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

    const renderPlaylist = (overrideProps = {}) => render(
        <Playlist
            playlistName="My Playlist"
            playlistTracks={[]}
            listType="playlistTracks"
            onUpdatePlaylistName={onUpdatePlaylistName}
            onRemovePlaylistTrack={onRemovePlaylistTrack}
            onSubmitPlaylist={onSubmitPlaylist}
            {...overrideProps}
        />
    );

    beforeEach(() => {
        onUpdatePlaylistName = vi.fn();
        onRemovePlaylistTrack = vi.fn();
        onSubmitPlaylist = vi.fn();
    });

    test('renders playlist name input with current value', () => {
        renderPlaylist({ playlistName: 'Summer Hits' });

        expect(screen.getByPlaceholderText('Type playlist name')).toHaveValue('Summer Hits');
    });

    test('calls onUpdatePlaylistName when playlist name input changes', () => {
        renderPlaylist();

        fireEvent.change(screen.getByPlaceholderText('Type playlist name'), {
            target: { value: 'New Playlist Name' },
        });

        expect(onUpdatePlaylistName).toHaveBeenCalledWith('New Playlist Name');
    });

    test('renders the empty-state message when no tracks exist', () => {
        renderPlaylist({ playlistTracks: [] });

        expect(
            screen.getByText('No tracks in playlist. Please add some tracks from the search results.')
        ).toBeInTheDocument();
    });

    test('hides the empty-state message when the playlist has tracks', () => {
        renderPlaylist({ playlistTracks: [mockTrack] });

        expect(
            screen.queryByText('No tracks in playlist. Please add some tracks from the search results.')
        ).not.toBeInTheDocument();
    });

    test('disables the save button when the playlist is empty', () => {
        renderPlaylist({ playlistTracks: [] });

        expect(screen.getByRole('button', { name: /save playlist/i })).toBeDisabled();
    });

    test('disables the save button when the playlist name is blank', () => {
        renderPlaylist({ playlistName: '   ', playlistTracks: [mockTrack] });

        expect(screen.getByRole('button', { name: /save playlist/i })).toBeDisabled();
    });

    test('enables the save button when the playlist has tracks and a name', () => {
        renderPlaylist({ playlistTracks: [mockTrack] });

        expect(screen.getByRole('button', { name: /save playlist/i })).not.toBeDisabled();
    });

    test('calls onSubmitPlaylist when save button is clicked', () => {
        renderPlaylist({ playlistTracks: [mockTrack] });

        fireEvent.click(screen.getByRole('button', { name: /save playlist/i }));

        expect(onSubmitPlaylist).toHaveBeenCalledTimes(1);
    });
});

