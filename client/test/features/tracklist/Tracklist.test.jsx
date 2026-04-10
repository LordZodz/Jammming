import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tracklist from '../../../src/features/tracklist/Tracklist';

const sampleTracklist = [
    {
        id: '1',
        name: 'Track One',
        artist: 'Artist One',
        album: 'Album One',
        image: 'test_image_1.jpg',
        uri: 'spotify:track:1'
    },
    {
        id: '2',
        name: 'Track Two',
        artist: 'Artist Two',
        album: 'Album Two',
        image: 'test_image_2.jpg',
        uri: 'spotify:track:2'
    }
];

describe('Tracklist', () => {
    let onAddSelectedTrack;
    let onRemovePlaylistTrack;

    beforeEach(() => {
        onAddSelectedTrack = vi.fn();
        onRemovePlaylistTrack = vi.fn();
    });

    test('renders all tracks from the provided tracks array', () => {
        render(
            <Tracklist 
                tracks={sampleTracklist} 
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack} 
            />
        );

        expect(screen.getByText('Track One')).toBeInTheDocument();
        expect(screen.getByText('Track Two')).toBeInTheDocument();
    });

    test('displays each track name, artist, album, and album cover image correctly', () => {
        render(
            <Tracklist 
                tracks={sampleTracklist} 
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack} 
            />
        );

        sampleTracklist.forEach((track) => {
            expect(screen.getByText(track.name)).toBeInTheDocument();
            expect(
                screen.getByText(`${track.artist} • ${track.album}`)
            ).toBeInTheDocument();
            expect(
                screen.getByAltText(`${track.name} album cover`)
            ).toHaveAttribute('src', track.image);
        });
    });

    test('renders nothing when the tracks array is empty', () => {
        render(
            <Tracklist
                tracks={[]}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
             />
        );
        expect(screen.queryByText('Track One')).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /album cover/i })).not.toBeInTheDocument();
    });
});