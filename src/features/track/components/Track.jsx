import styles from '../styles/track.module.css';
import addIcon from '../../../assets/images/plus.svg';
import removeIcon from '../../../assets/images/minus.svg';

/** 
 * This presentation component is responsible for rendering a single track in the application. 
 * It will display the track information based on the data received from the Spotify API.
 * 
 * @returns {JSX.Element} The rendered Track component.
 */

function Track(props) {
    return (
        <div id={props.id} className={styles.trackBox}>
            <div className={styles.trackInfo}>
                <p>{props.name}</p>
                <p>{props.artist}</p>
                <p>{props.album}</p>
            </div>
            <div>
                {props.listType === 'searchResults' && (
                    <button
                        className={styles.addButton}
                        type="button"
                        aria-label={`Add ${props.name} to playlist`}
                        onClick={() => props.onAddSelectedTrack(props)}
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
                        aria-label={`Remove ${props.name} from playlist`}
                        onClick={() => props.onRemovePlaylistTrack(props)}
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