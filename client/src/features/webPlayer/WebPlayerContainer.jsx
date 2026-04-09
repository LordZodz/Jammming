import { useState, useEffect, useRef } from 'react';
import WebPlayer from './WebPlayer';
import { AUTH_TOKEN, Spotify } from '../../utils/api_spotify/spotify';

const SDK_SCRIPT_SRC = 'https://sdk.scdn.co/spotify-player.js';

function WebPlayerContainer(props) {

    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [repeatMode, setRepeatMode] = useState(0);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);

    useEffect(() => {
        const backendTokenUrl = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_TOKEN}`;

        const initializePlayer = () => {
            // Prevent double-initialization (React StrictMode runs effects twice in development)
            if (playerRef.current) return;

            const spotifyPlayer = new window.Spotify.Player({
                name: 'Jammming Web Player',
                getOAuthToken: async cb => {
                    try {
                        const response = await fetch(backendTokenUrl, { credentials: 'include' });
                        if (!response.ok) {
                            console.error('Failed to retrieve token for Web Playback SDK:', response.statusText);
                            return;
                        }
                        const json = await response.json();
                        cb(json.access_token);
                    } catch (error) {
                        console.error('Network error retrieving token for Web Playback SDK:', error);
                    }
                },
                volume: 0.5,
            });

            playerRef.current = spotifyPlayer;
            setPlayer(spotifyPlayer);

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log(`Web Playback SDK is ready with Device ID: ${device_id}`);
                setDeviceId(device_id);
                if (props.onDeviceReady) props.onDeviceReady(device_id);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log(`Web Playback SDK device has gone offline: ${device_id}`);
            });

            spotifyPlayer.addListener('player_state_changed', (state) => {
                if (!state) return;
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setRepeatMode(state.repeat_mode);
                setPosition(state.position);
                setDuration(state.duration);
                spotifyPlayer.getCurrentState().then(currentState => setActive(!!currentState));
            });

            spotifyPlayer.connect();
        };

        if (window.Spotify) {
            // SDK already loaded (e.g. after a re-mount) — initialize directly since
            // onSpotifyWebPlaybackSDKReady will not fire again.
            initializePlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initializePlayer;
            // Guard against appending a duplicate script tag (e.g. StrictMode double-invoke)
            if (!document.querySelector(`script[src="${SDK_SCRIPT_SRC}"]`)) {
                const script = document.createElement('script');
                script.src = SDK_SCRIPT_SRC;
                script.async = true;
                document.body.appendChild(script);
            }
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.removeListener('ready');
                playerRef.current.removeListener('not_ready');
                playerRef.current.removeListener('player_state_changed');
                playerRef.current.disconnect();
                playerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!is_active || is_paused) return;
        const interval = setInterval(() => {
            setPosition(prev => prev + 500);
        }, 500);
        return () => clearInterval(interval);
    }, [is_active, is_paused]);

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        if (playerRef.current) playerRef.current.setVolume(newVolume);
    };

    const handleSeek = (positionMs) => {
        setPosition(positionMs);
        if (playerRef.current) playerRef.current.seek(positionMs);
    };

    const REPEAT_STATES = ['off', 'context', 'track'];

    const handleRepeatChange = async () => {
        const nextMode = (repeatMode + 1) % 3;
        const result = await Spotify.setRepeat(REPEAT_STATES[nextMode]);
        if (result.ok) {
            setRepeatMode(nextMode);
        } else {
            console.error('Failed to set repeat mode:', result.error);
        }
    };

    return (
        <WebPlayer
            player={player}
            is_paused={is_paused}
            is_active={is_active}
            current_track={current_track}
            deviceId={deviceId}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            repeatMode={repeatMode}
            onRepeatChange={handleRepeatChange}
            position={position}
            duration={duration}
            onSeek={handleSeek}
        />
    );
};

export default WebPlayerContainer;