import styles from './track.module.css';
import addIcon from '../../assets/images/plus.svg';
import removeIcon from '../../assets/images/minus.svg';

/** 
 * This presentation component is responsible for rendering a single track in the application. 
 * It will display the track information based on the data received from the Spotify API.
 * 
 * @returns {JSX.Element} The rendered Track component.
 */

function Track(props) {
    return (
        <div id={props.track.id} className={styles.trackBox}>
            <div className={styles.trackDetails}>
                <div className={styles.albumCoverContainer}>
                    <img src={props.track.image} alt={`${props.track.name} album cover`} className={styles.albumCover} />
                </div>
                <div className={styles.textInfo}>
                    <p>{props.track.name}</p>
                    <div className={styles.artistAlbum}>
                        <p>{props.track.artist} • {props.track.album}</p>
                    </div>
                </div>
            </div>
            <div>
                {props.listType === 'searchResults' && (
                    <button
                        className={styles.addButton}
                        type="button"
                        aria-label={`Add ${props.track.name} to playlist`}
                        onClick={() => props.onAddSelectedTrack(props.track)}
                    >
                        <img
                            src={addIcon}
                            alt=""
                            aria-hidden="true"
                            className={styles.addIcon}
                        />
                    </button>
                )}
                {props.listType === 'playlistTracks' && (
                    <button
                        className={styles.removeButton}
                        type="button"
                        aria-label={`Remove ${props.track.name} from playlist`}
                        onClick={() => props.onRemovePlaylistTrack(props.track)}
                    >
                        <img
                            src={removeIcon}
                            alt=""
                            aria-hidden="true"
                            className={styles.removeIcon}
                        />
                    </button>
                )}
            </div>
        </div>
    )
};

export default Track;