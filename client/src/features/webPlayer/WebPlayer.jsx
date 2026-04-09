import { useState } from 'react';
import styles from './WebPlayer.module.css';

function WebPlayer(props) {
    const { player, is_paused, is_active, current_track, volume, onVolumeChange, repeatMode, onRepeatChange, position, duration, onSeek } = props;

    const [seekValue, setSeekValue] = useState(null);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const displayPosition = seekValue !== null ? seekValue : position;

    if (!is_active) {
        return (
            <div className={styles.webPlayerContainer}>
                <div className={styles.inactiveMessage}>
                    <p>Transfer playback to <b>Jammming Web Player</b> in your Spotify app to use the player.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.webPlayerContainer}>
            <div className={styles.webPlayerWrapper}>
                <div className={styles.webPlayerMain}>
                <img
                    src={current_track?.album?.images?.[0]?.url}
                    alt={current_track ? `${current_track.name} album cover` : ''}
                    className={styles.albumCover}
                />
                <div className={styles.trackInfo}>
                    <p className={styles.trackName}>{current_track?.name}</p>
                    <p className={styles.artistName}>{current_track?.artists?.[0]?.name}</p>
                </div>
                <div className={styles.controls}>
                    <button
                        className={styles.controlButton}
                        aria-label="Previous track"
                        onClick={() => player.previousTrack()}
                    >
                        &laquo;
                    </button>
                    <button
                        className={styles.controlButton}
                        aria-label={is_paused ? 'Play' : 'Pause'}
                        onClick={() => player.togglePlay()}
                    >
                        {is_paused ? '▶' : '❚❚'}
                    </button>
                    <button
                        className={styles.controlButton}
                        aria-label="Next track"
                        onClick={() => player.nextTrack()}
                    >
                        &raquo;
                    </button>
                    <button
                        className={`${styles.controlButton}${repeatMode > 0 ? ` ${styles.controlButtonActive}` : ''}`}
                        aria-label={['Repeat off', 'Repeat all', 'Repeat track'][repeatMode]}
                        onClick={onRepeatChange}
                    >
                        {repeatMode === 2 ? '↺¹' : '↺'}
                    </button>
                    <input
                        className={styles.volumeSlider}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        aria-label="Volume"
                    />
                </div>
                </div>
                <div className={styles.seekBar}>
                    <span className={styles.seekTime}>{formatTime(displayPosition)}</span>
                    <input
                        className={styles.seekSlider}
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={displayPosition}
                        onChange={(e) => setSeekValue(Number(e.target.value))}
                        onPointerUp={(e) => {
                            onSeek(Number(e.target.value));
                            setSeekValue(null);
                        }}
                        aria-label="Song position"
                    />
                    <span className={styles.seekTime}>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default WebPlayer;