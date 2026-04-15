import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Track from '../../../src/features/track/Track';
import { sampleTrack, explicitSampleTrack } from '../../setup/fixtures';

describe('Track', () => {
    let onAddSelectedTrack;
    let onRemovePlaylistTrack;
    let onPlayTrack;

    const baseTrack = sampleTrack;

    const renderTrack = (overrideProps = {}) => render(
        <Track
            track={baseTrack}
            listType="searchResults"
            onAddSelectedTrack={onAddSelectedTrack}
            onRemovePlaylistTrack={onRemovePlaylistTrack}
            onPlayTrack={onPlayTrack}
            {...overrideProps}
        />
    );

    beforeEach(() => {
        onAddSelectedTrack = vi.fn();
        onRemovePlaylistTrack = vi.fn();
        onPlayTrack = vi.fn();
    });

    test('renders track metadata and album artwork', () => {
        renderTrack();

        expect(screen.getByText('Test Track')).toBeInTheDocument();
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
        expect(screen.getByText('Test Album')).toBeInTheDocument();
        expect(screen.getByText('3:30')).toBeInTheDocument();
        expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', baseTrack.image);
    });

    test('hides the explicit badge when the track is not explicit', () => {
        renderTrack();

        expect(screen.queryByLabelText('Explicit')).not.toBeInTheDocument();
    });

    test('shows the explicit badge when the track is explicit', () => {
        renderTrack({ track: explicitSampleTrack });

        expect(screen.getByLabelText('Explicit')).toBeInTheDocument();
    });

    test('renders play and add actions for search results only', () => {
        renderTrack();

        expect(screen.getByRole('button', { name: /play test track/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add test track to playlist/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /remove test track from playlist/i })).not.toBeInTheDocument();
    });

    test('renders only the remove action for playlist tracks', () => {
        renderTrack({ listType: 'playlistTracks' });

        expect(screen.getByRole('button', { name: /remove test track from playlist/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /play test track/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /add test track to playlist/i })).not.toBeInTheDocument();
    });

    test('calls onAddSelectedTrack with the track data when the add button is clicked', () => {
        renderTrack();

        fireEvent.click(screen.getByRole('button', { name: /add test track to playlist/i }));

        expect(onAddSelectedTrack).toHaveBeenCalledWith(expect.objectContaining(baseTrack));
    });

    test('calls onRemovePlaylistTrack with the track data when the remove button is clicked', () => {
        renderTrack({ listType: 'playlistTracks' });

        fireEvent.click(screen.getByRole('button', { name: /remove test track from playlist/i }));

        expect(onRemovePlaylistTrack).toHaveBeenCalledWith(expect.objectContaining(baseTrack));
    });

    test('calls onPlayTrack with the track uri when the play button is clicked', () => {
        renderTrack();

        fireEvent.click(screen.getByRole('button', { name: /play test track/i }));

        expect(onPlayTrack).toHaveBeenCalledWith('spotify:track:12345');
    });
});
