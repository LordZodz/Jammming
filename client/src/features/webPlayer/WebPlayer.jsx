import { useState, useEffect, useRef } from 'react';
import styles from './WebPlayer.module.css';

function useMarquee(dep, active) {
    const ref = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        if (!active || !ref.current) {
            setShouldScroll(false);
            return;
        }

        const el = ref.current;

        const measure = () => {
            const overflow = el.scrollWidth - el.parentElement.clientWidth;
            if (overflow > 0) {
                const newOffset = `-${overflow}px`;
                const prevOffset = el.style.getPropertyValue('--marquee-offset');
                el.style.setProperty('--marquee-offset', newOffset);
                if (prevOffset && prevOffset !== newOffset) {
                    // Restart the animation so it immediately uses the new offset
                    // rather than waiting for the current iteration to finish
                    el.style.animation = 'none';
                    void el.offsetHeight; // force reflow to flush the change
                    el.style.animation = '';
                }
                setShouldScroll(true);
            } else {
                el.style.removeProperty('--marquee-offset');
                setShouldScroll(false);
            }
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(el.parentElement);

        return () => observer.disconnect();
    }, [dep, active]);

    return [ref, shouldScroll];
}

function WebPlayer(props) {
    const { player, is_paused, is_active, current_track, volume, onVolumeChange, repeatMode, onRepeatChange, position, duration, onSeek } = props;

    const [seekValue, setSeekValue] = useState(null);
    const [trackNameRef, scrollTrackName] = useMarquee(current_track?.name, is_active);
    const [artistNameRef, scrollArtistName] = useMarquee(current_track?.artists?.[0]?.name, is_active);

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
                <div className={styles.webPlayerTrackInfo}>
                    <img
                        src={current_track?.album?.images?.[0]?.url}
                        alt={current_track ? `${current_track.name} album cover` : ''}
                        className={styles.albumCover}
                    />
                    <div className={styles.trackInfo}>
                        <p
                            ref={trackNameRef}
                            className={`${styles.trackName} ${scrollTrackName ? styles.trackNameScroll : ''}`}
                        >
                            {current_track?.name}
                        </p>
                        <p
                            className={`${styles.artistName} ${scrollArtistName ? styles.artistNameScroll : ''}`}
                            ref={artistNameRef}
                        >
                            {current_track?.artists?.[0]?.name}
                        </p>
                    </div>
                </div>
                <div className={styles.webPlayerMain}>
                    <div className={styles.trackControls}>
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
                <div className={styles.webPlayerMisc}>
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
        </div>
    );
};

export default WebPlayer;