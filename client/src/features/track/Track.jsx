import styles from './track.module.css';
import addIcon from '../../assets/images/plus.svg';
import removeIcon from '../../assets/images/minus.svg';
import playTrackIcon from '../../assets/images/play_track.svg';

/** 
 * This presentation component is responsible for rendering a single track in the application. 
 * It will display the track information based on the data received from the Spotify API.
 * 
 * @returns {JSX.Element} The rendered Track component.
 */

function Track({ track, listType, onPlayTrack, onAddSelectedTrack, onRemovePlaylistTrack }) {
    return (
        <div id={track.id} className={styles.trackBox}>
            <div className={styles.trackDetails}>
                <div className={styles.albumCoverContainer}>
                    <img src={track.image} alt={`${track.name} album cover`} className={styles.albumCover} />
                </div>
                <div className={styles.textInfo}>
                    <div className={styles.trackName}>
                        {track.explicit && <span className={styles.explicitBadge} aria-label="Explicit">E</span>}
                        <p>{track.name}</p>
                    </div>
                    <div className={styles.trackArtist}>
                        <p>{track.artist}</p>
                    </div>
                    <div className={styles.trackAlbum}>
                        <p>{track.album}</p>
                    </div>
                </div>
            </div>
            <div className={styles.trackDuration}>
                <p>{track.duration}</p>
            </div>
            {listType === 'searchResults' && (
                <div className={styles.searchResultActions}>
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.playButton}
                            type="button"
                            aria-label={`Play ${track.name}`}
                            onClick={() => onPlayTrack(track.uri)}
                        >
                            <img
                                src={playTrackIcon}
                                alt=""
                                aria-hidden="true"
                                className={styles.playTrackIcon}
                            />
                        </button>
                        <button
                            className={styles.addButton}
                            type="button"
                            aria-label={`Add ${track.name} to playlist`}
                            onClick={() => onAddSelectedTrack(track)}
                        >
                            <img
                                src={addIcon}
                                alt=""
                                aria-hidden="true"
                                className={styles.addIcon}
                            />
                        </button>
                    </div>
                </div>
            )}
            {listType === 'playlistTracks' && (
                <div className={styles.playlistTrackActions}>
                    <button
                        className={styles.removeButton}
                        type="button"
                        aria-label={`Remove ${track.name} from playlist`}
                        onClick={() => onRemovePlaylistTrack(track)}
                    >
                        <img
                            src={removeIcon}
                            alt=""
                            aria-hidden="true"
                            className={styles.removeIcon}
                        />
                    </button>
                </div>
            )}
        </div>
    )
};

export default Track;