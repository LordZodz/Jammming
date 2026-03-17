import { test, expect, describe, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrackContainer from '../../../src/features/track/containers/TrackContainer';
import testImg from '../../assets/images/test_album_img.jpeg';

/**
 * Test suite for the TrackContainer component, which is responsible for managing the state and logic related to a single track in the application.
 * The tests cover the component's ability to receive track information through props, update its local state accordingly, and pass the correct data down to the Track presentation component for rendering.
 */

const baseInfo = {
    id: '1',
    name: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    image: testImg,
    uri: 'spotify:track:12345',
    listType: 'searchResults',
    onAddSelectedTrack: vi.fn(),
    onRemovePlaylistTrack: vi.fn()
};

describe('TrackContainer Component', () => {
    test('receives track information through props and updates state', () => {
        const { rerender } = render(<TrackContainer trackInfo={baseInfo} {...baseInfo} />);

        expect(screen.getByText('Test Track')).toBeInTheDocument();
        expect(screen.getByText('Test Artist • Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Test Track album cover')).toHaveAttribute('src', testImg);

        // Update the track information and verify that the component updates accordingly
        const newInfo = {
            ...baseInfo,
            name: 'Updated Test Track',
            artist: 'Updated Test Artist',
            album: 'Updated Test Album'
        };

        rerender(<TrackContainer trackInfo={newInfo} {...newInfo} />);

        expect(screen.getByText('Updated Test Track')).toBeInTheDocument();
        expect(screen.getByText('Updated Test Artist • Updated Test Album')).toBeInTheDocument();
        expect(screen.getByAltText('Updated Test Track album cover')).toHaveAttribute('src', testImg);
    });

});