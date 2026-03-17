import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrackContainer from '../../../src/features/track/containers/TrackContainer';
import testImg from '../../assets/images/test_album_img.jpeg';

const sampleTrack = {
    id: '1',
    name: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    image: testImg,
    uri: 'spotify:track:12345',
};

describe('TrackContainer', () => {
    let onAddSelectedTrack;
    let onRemovePlaylistTrack;

    beforeEach(() => {
        onAddSelectedTrack = vi.fn();
        onRemovePlaylistTrack = vi.fn();
    });

    test('renders track information from the provided trackInfo prop', () => {
        render(
            <TrackContainer
                trackInfo={sampleTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        expect(screen.getByText('Test Track')).toBeInTheDocument();
        expect(screen.getByText('Test Artist • Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', testImg);
    });

    test('updates the rendered track information when trackInfo changes', () => {
        const { rerender } = render(
            <TrackContainer
                trackInfo={sampleTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        const updatedTrack = {
            ...sampleTrack,
            name: 'Updated Test Track',
            artist: 'Updated Test Artist',
            album: 'Updated Test Album',
        };

        rerender(
            <TrackContainer
                trackInfo={updatedTrack}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        expect(screen.getByText('Updated Test Track')).toBeInTheDocument();
        expect(screen.getByText('Updated Test Artist • Updated Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Updated Test Track album cover')).toHaveAttribute('src', testImg);
    });
});