import { useState } from 'react';
import { useMarquee } from '../../utils/animations/textAnimations';
import { formatTime } from '../../utils/helpers/timeFormats';
import styles from './WebPlayer.module.css';
import playIcon from '../../assets/images/UI/play.svg';
import pauseIcon from '../../assets/images/UI/pause.svg';
import playNextIcon from '../../assets/images/UI/play_next.svg';
import playPreviousIcon from '../../assets/images/UI/play_prev.svg';
import repeatIcon from '../../assets/images/UI/repeat.svg';
import repeatTrackIcon from '../../assets/images/UI/repeat_track.svg';
import muteIcon from '../../assets/images/UI/volume_mute.svg';
import volumeLowIcon from '../../assets/images/UI/volume_low.svg';
import volumeMediumIcon from '../../assets/images/UI/volume_medium.svg';
import volumeHighIcon from '../../assets/images/UI/volume_high.svg';

const VOLUME_ICONS = {
    muted: { src: muteIcon, alt: 'Muted' },
    low: { src: volumeLowIcon, alt: 'Low volume' },
    medium: { src: volumeMediumIcon, alt: 'Medium volume' },
    high: { src: volumeHighIcon, alt: 'High volume' },
};

const buildSliderGradient = (valuePct, hover) => {
    if (!hover.visible) {
        return `linear-gradient(to right, var(--brand-color) ${valuePct}%, rgba(255,255,255,0.4) ${valuePct}%)`;
    }
    const hoverPct = hover.pct * 100;
    if (hoverPct > valuePct) {
        return `linear-gradient(to right, var(--brand-color) ${valuePct}%, white ${valuePct}%, white ${hoverPct}%, rgba(255,255,255,0.4) ${hoverPct}%)`;
    }
    return `linear-gradient(to right, var(--brand-color) ${valuePct}%, rgba(255,255,255,0.4) ${valuePct}%)`;
};

function WebPlayer(props) {
    const { player, is_paused, is_active, current_track,
        volume, volumeMode, onVolumeChange, onMuteToggle,
        repeatMode, onRepeatChange, position, duration, onSeek
    } = props;

    const [seekValue, setSeekValue] = useState(null);
    const [hoverSeek, setHoverSeek] = useState({ visible: false, x: 0, pct: 0, time: 0 });
    const [hoverVolume, setHoverVolume] = useState({ visible: false, pct: 0 });
    const [trackNameRef, scrollTrackName] = useMarquee(current_track?.name, is_active);
    const [artistNameRef, scrollArtistName] = useMarquee(current_track?.artists?.[0]?.name, is_active);
    const [albumNameRef, scrollAlbumName] = useMarquee(current_track?.album?.name, is_active);

    const displayPosition = seekValue !== null ? seekValue : position;

    const playedPct = duration > 0 ? (displayPosition / duration) * 100 : 0;
    const isDragging = seekValue !== null;
    const seekTrackBackground = buildSliderGradient(playedPct, isDragging ? { visible: false } : hoverSeek);
    const volumeTrackBackground = buildSliderGradient(volume * 100, hoverVolume);

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
                        <p
                            className={`${styles.albumName} ${scrollAlbumName ? styles.albumNameScroll : ''}`}
                            ref={albumNameRef}
                        >
                            {current_track?.album?.name}
                        </p>
                    </div>
                </div>
                <div className={styles.webPlayerMain}>
                    <div className={styles.trackControls}>
                        <button
                            className={styles.controlButtons}
                            aria-label="Previous track"
                            onClick={() => player.previousTrack()}
                        >
                            <img
                                src={playPreviousIcon}
                                alt="Previous track"
                                className={styles.prevTrackIcon}
                            />
                        </button>
                        <button
                            className={styles.controlButtons}
                            aria-label={is_paused ? 'Play' : 'Pause'}
                            onClick={() => player.togglePlay()}
                        >
                            <img
                                src={is_paused ? playIcon : pauseIcon}
                                alt={is_paused ? 'Play' : 'Pause'}
                                className={styles.playPauseIcon}
                            />
                        </button>
                        <button
                            className={styles.controlButtons}
                            aria-label="Next track"
                            onClick={() => player.nextTrack()}
                        >
                            <img
                                src={playNextIcon}
                                alt="Next track"
                                className={styles.nextTrackIcon}
                            />
                        </button>
                    </div>
                    <div className={styles.seekBar}>
                        <span className={styles.seekTime}>{formatTime(displayPosition)}</span>
                        <div
                            className={styles.seekSliderWrapper}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                                const pct = x / rect.width;
                                setHoverSeek({ visible: true, x, pct, time: Math.round(pct * (duration || 0)) });
                            }}
                            onMouseLeave={() => setHoverSeek({ visible: false, x: 0, pct: 0, time: 0 })}
                        >
                            {hoverSeek.visible && (
                                <div
                                    className={styles.seekTooltip}
                                    style={{ left: hoverSeek.x }}
                                >
                                    {formatTime(hoverSeek.time)}
                                </div>
                            )}
                            <input
                                className={styles.seekSlider}
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={displayPosition}
                                style={{ background: seekTrackBackground }}
                                onPointerDown={(e) => { if (e.button !== 0) e.preventDefault(); }}
                                onChange={(e) => setSeekValue(Number(e.target.value))}
                                onPointerUp={(e) => {
                                    if (e.button !== 0) return;
                                    onSeek(Number(e.target.value));
                                    setSeekValue(null);
                                }}
                                aria-label="Song position"
                            />
                        </div>
                        <span className={styles.seekTime}>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className={styles.webPlayerMisc}>
                    <button
                        className={`${styles.controlButtons}${repeatMode > 0 ? ` ${styles.controlButtonsActive}` : ''}`}
                        aria-label={['Repeat off', 'Repeat all', 'Repeat track'][repeatMode]}
                        onClick={onRepeatChange}
                    >
                        <span
                            aria-hidden="true"
                            className={`${styles.repeatIcon}${repeatMode > 0 ? ` ${styles.repeatIconActive}` : ''}`}
                            style={{
                                maskImage: `url(${repeatMode === 2 ? repeatTrackIcon : repeatIcon})`,
                                WebkitMaskImage: `url(${repeatMode === 2 ? repeatTrackIcon : repeatIcon})`,
                            }}
                        />
                    </button>
                    <button
                        className={`${styles.controlButtons}${volume === 0 ? ` ${styles.controlButtonsActive}` : ''}`}
                        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                        onClick={onMuteToggle}
                    >
                        <img src={VOLUME_ICONS[volumeMode].src} alt={VOLUME_ICONS[volumeMode].alt} className={styles.volumeIcon} />
                    </button>
                    <input
                        className={styles.volumeSlider}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        style={{ background: volumeTrackBackground }}
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                            setHoverVolume({ visible: true, pct: x / rect.width });
                        }}
                        onMouseLeave={() => setHoverVolume({ visible: false, pct: 0 })}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        aria-label="Volume"
                    />
                </div>
            </div>
        </div>
    );
};

export default WebPlayer;