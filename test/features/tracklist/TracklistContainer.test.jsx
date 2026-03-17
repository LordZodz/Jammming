import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TracklistContainer from '../../../src/features/tracklist/containers/TracklistContainer';

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

describe('TracklistContainer', () => {
    let onAddSelectedTrack;
    let onRemovePlaylistTrack;

    beforeEach(() => {
        onAddSelectedTrack = vi.fn();
        onRemovePlaylistTrack = vi.fn();
    });

    test('renders tracks from the provided tracklist', () => {
        render(
            <TracklistContainer 
                tracklist={sampleTracklist} 
                listType="searchResults" 
                onAddSelectedTrack={onAddSelectedTrack} 
                onRemovePlaylistTrack={onRemovePlaylistTrack} 
            />
        );

        expect(screen.getByText('Track One')).toBeInTheDocument();
        expect(screen.getByText('Track Two')).toBeInTheDocument();
    });

    test('updates the rendered track list when the tracklist prop changes', () => {
        const { rerender } = render(
            <TracklistContainer 
                tracklist={sampleTracklist} 
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack} 
            />
        );

        expect(screen.getByText('Track One')).toBeInTheDocument();
        expect(screen.getByText('Track Two')).toBeInTheDocument();

        const updatedTracklist = [
            ...sampleTracklist,
            {
                id: '3',
                name: 'Track Three',
                artist: 'Artist Three',
                album: 'Album Three',
                image: 'test_image_3.jpg',
                uri: 'spotify:track:3'
            }
        ];

        rerender(
            <TracklistContainer 
                tracklist={updatedTracklist} 
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack} 
            />
        );

        expect(screen.getByText('Track Three')).toBeInTheDocument();
    });

    test('displays each track name, artist, album, and album cover image correctly', () => {
        render(
            <TracklistContainer
                tracklist={sampleTracklist}
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
});
