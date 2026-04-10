import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WebPlayerContainer from '../../../src/features/webPlayer/WebPlayerContainer';

vi.mock('../../../src/utils/api_spotify/spotify', () => ({
    AUTH_TOKEN: '/auth/token',
    Spotify: {
        setRepeat: vi.fn(),
    },
}));

import { Spotify } from '../../../src/utils/api_spotify/spotify';

vi.mock('../../../src/features/webPlayer/WebPlayer', () => ({
    default: ({ is_active, is_paused, current_track, volume, repeatMode, onVolumeChange, onMuteToggle, onSeek, onRepeatChange }) => (
        <div
            data-testid="web-player"
            data-is-active={String(is_active)}
            data-is-paused={String(is_paused)}
            data-repeat-mode={String(repeatMode)}
            data-volume={String(volume)}
            data-track-name={current_track?.name ?? ''}
        >
            <button data-testid="volume-btn" onClick={() => onVolumeChange(0.8)} />
            <button data-testid="mute-btn" onClick={onMuteToggle} />
            <button data-testid="seek-btn" onClick={() => onSeek(5000)} />
            <button data-testid="repeat-btn" onClick={onRepeatChange} />
        </div>
    ),
}));

describe('WebPlayerContainer', () => {
    let playerListeners;
    let mockPlayerInstance;
    let playerConstructorSpy;

    beforeEach(() => {
        vi.clearAllMocks();
        playerListeners = {};

        mockPlayerInstance = {
            addListener: vi.fn((event, cb) => { playerListeners[event] = cb; }),
            removeListener: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
            setVolume: vi.fn(),
            seek: vi.fn(),
            getCurrentState: vi.fn().mockResolvedValue(null),
        };

        playerConstructorSpy = vi.fn();

        // window.Spotify.Player is called with `new`, so it must be a regular function —
        // arrow functions cannot be used as constructors.
        // Returning an object from a constructor overrides the default `this` instance.
        const instance = mockPlayerInstance;
        const spy = playerConstructorSpy;
        vi.stubGlobal('Spotify', {
            Player: function SpotifyPlayer(options) {
                spy(options);
                return instance;
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('initializes the Spotify SDK player on mount with the correct name and volume', () => {
        render(<WebPlayerContainer />);

        expect(playerConstructorSpy).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Jammming Web Player', volume: 0.5 })
        );
        expect(mockPlayerInstance.connect).toHaveBeenCalledTimes(1);
    });

    test('registers ready, not_ready, and player_state_changed listeners on mount', () => {
        render(<WebPlayerContainer />);

        expect(mockPlayerInstance.addListener).toHaveBeenCalledWith('ready', expect.any(Function));
        expect(mockPlayerInstance.addListener).toHaveBeenCalledWith('not_ready', expect.any(Function));
        expect(mockPlayerInstance.addListener).toHaveBeenCalledWith('player_state_changed', expect.any(Function));
    });

    test('calls onDeviceReady with the device_id when the ready event fires', () => {
        const onDeviceReady = vi.fn();
        render(<WebPlayerContainer onDeviceReady={onDeviceReady} />);

        act(() => {
            playerListeners['ready']({ device_id: 'test-device-123' });
        });

        expect(onDeviceReady).toHaveBeenCalledWith('test-device-123');
    });

    test('renders WebPlayer with is_active false before any player state event', () => {
        render(<WebPlayerContainer />);

        expect(screen.getByTestId('web-player')).toHaveAttribute('data-is-active', 'false');
    });

    test('updates track, paused state, and repeat mode when player_state_changed fires', async () => {
        mockPlayerInstance.getCurrentState.mockResolvedValue({ active: true });
        render(<WebPlayerContainer />);

        act(() => {
            playerListeners['player_state_changed']({
                track_window: {
                    current_track: {
                        name: 'Supermassive Black Hole',
                        artists: [{ name: 'Muse' }],
                        album: { images: [{ url: 'img.jpg' }] },
                    },
                },
                paused: true,
                repeat_mode: 1,
                position: 15000,
                duration: 220000,
            });
        });

        await waitFor(() => {
            const player = screen.getByTestId('web-player');
            expect(player).toHaveAttribute('data-track-name', 'Supermassive Black Hole');
            expect(player).toHaveAttribute('data-is-paused', 'true');
            expect(player).toHaveAttribute('data-repeat-mode', '1');
        });
    });

    test('sets is_active to true when getCurrentState resolves with a state object', async () => {
        mockPlayerInstance.getCurrentState.mockResolvedValue({ active: true });
        render(<WebPlayerContainer />);

        act(() => {
            playerListeners['player_state_changed']({
                track_window: { current_track: null },
                paused: false,
                repeat_mode: 0,
                position: 0,
                duration: 0,
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId('web-player')).toHaveAttribute('data-is-active', 'true');
        });
    });

    test('sets is_active to false when getCurrentState resolves with null', async () => {
        mockPlayerInstance.getCurrentState.mockResolvedValue(null);
        render(<WebPlayerContainer />);

        act(() => {
            playerListeners['player_state_changed']({
                track_window: { current_track: null },
                paused: false,
                repeat_mode: 0,
                position: 0,
                duration: 0,
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId('web-player')).toHaveAttribute('data-is-active', 'false');
        });
    });

    test('handleVolumeChange updates displayed volume and calls player.setVolume', () => {
        render(<WebPlayerContainer />);

        fireEvent.click(screen.getByTestId('volume-btn'));

        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0.8');
        expect(mockPlayerInstance.setVolume).toHaveBeenCalledWith(0.8);
    });

    test('handleMuteToggle mutes by setting volume to 0 and calling player.setVolume', () => {
        render(<WebPlayerContainer />);

        // Default volume is 0.5; clicking mute should set it to 0
        fireEvent.click(screen.getByTestId('mute-btn'));

        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0');
        expect(mockPlayerInstance.setVolume).toHaveBeenCalledWith(0);
    });

    test('handleMuteToggle unmutes by restoring the volume that was active before muting', () => {
        render(<WebPlayerContainer />);

        // Mute — saves 0.5 as pre-mute volume
        fireEvent.click(screen.getByTestId('mute-btn'));
        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0');

        // Unmute — should restore 0.5
        fireEvent.click(screen.getByTestId('mute-btn'));
        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0.5');
        expect(mockPlayerInstance.setVolume).toHaveBeenLastCalledWith(0.5);
    });

    test('moving the slider while muted discards the pre-mute volume', () => {
        render(<WebPlayerContainer />);

        // Mute — saves 0.5
        fireEvent.click(screen.getByTestId('mute-btn'));
        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0');

        // Slider moved to 0.3 while muted — discards saved pre-mute value
        fireEvent.click(screen.getByTestId('volume-btn')); // fires onVolumeChange(0.8)
        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0.8');

        // Muting again now should NOT restore 0.5
        fireEvent.click(screen.getByTestId('mute-btn'));
        expect(screen.getByTestId('web-player')).toHaveAttribute('data-volume', '0');
        expect(mockPlayerInstance.setVolume).not.toHaveBeenCalledWith(0.5);
    });

    test('handleSeek calls player.seek with the given position in ms', () => {
        render(<WebPlayerContainer />);

        fireEvent.click(screen.getByTestId('seek-btn'));

        expect(mockPlayerInstance.seek).toHaveBeenCalledWith(5000);
    });

    test('handleRepeatChange cycles repeat mode and calls Spotify.setRepeat on success', async () => {
        Spotify.setRepeat.mockResolvedValue({ ok: true });
        render(<WebPlayerContainer />);

        // repeatMode starts at 0; next is 1 → 'context'
        fireEvent.click(screen.getByTestId('repeat-btn'));

        await waitFor(() => {
            expect(Spotify.setRepeat).toHaveBeenCalledWith('context');
            expect(screen.getByTestId('web-player')).toHaveAttribute('data-repeat-mode', '1');
        });

        // Click again: 1 → 2 → 'track'
        fireEvent.click(screen.getByTestId('repeat-btn'));

        await waitFor(() => {
            expect(Spotify.setRepeat).toHaveBeenCalledWith('track');
            expect(screen.getByTestId('web-player')).toHaveAttribute('data-repeat-mode', '2');
        });

        // Click again: 2 → 0 → 'off'
        fireEvent.click(screen.getByTestId('repeat-btn'));

        await waitFor(() => {
            expect(Spotify.setRepeat).toHaveBeenCalledWith('off');
            expect(screen.getByTestId('web-player')).toHaveAttribute('data-repeat-mode', '0');
        });
    });

    test('handleRepeatChange does not update repeatMode when Spotify.setRepeat fails', async () => {
        Spotify.setRepeat.mockResolvedValue({ ok: false, error: 'server error' });
        render(<WebPlayerContainer />);

        fireEvent.click(screen.getByTestId('repeat-btn'));

        await waitFor(() => {
            expect(Spotify.setRepeat).toHaveBeenCalledWith('context');
        });

        expect(screen.getByTestId('web-player')).toHaveAttribute('data-repeat-mode', '0');
    });

    test('removes all listeners and disconnects the player on unmount', () => {
        const { unmount } = render(<WebPlayerContainer />);

        unmount();

        expect(mockPlayerInstance.removeListener).toHaveBeenCalledWith('ready');
        expect(mockPlayerInstance.removeListener).toHaveBeenCalledWith('not_ready');
        expect(mockPlayerInstance.removeListener).toHaveBeenCalledWith('player_state_changed');
        expect(mockPlayerInstance.disconnect).toHaveBeenCalledTimes(1);
    });
});