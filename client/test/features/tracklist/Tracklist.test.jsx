import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tracklist from '../../../src/features/tracklist/Tracklist';
import { sampleTracklist } from '../../setup/fixtures';

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

    test('displays track metadata and only shows explicit badges for explicit tracks', () => {
        render(
            <Tracklist
                tracks={sampleTracklist}
                listType="searchResults"
                onAddSelectedTrack={onAddSelectedTrack}
                onRemovePlaylistTrack={onRemovePlaylistTrack}
            />
        );

        expect(screen.getAllByLabelText('Explicit')).toHaveLength(1);

        sampleTracklist.forEach((track) => {
            expect(screen.getByText(track.name)).toBeInTheDocument();
            expect(screen.getByText(track.artist)).toBeInTheDocument();
            expect(screen.getByText(track.album)).toBeInTheDocument();
            expect(screen.getByText(track.duration)).toBeInTheDocument();
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