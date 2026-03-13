import styles from '../styles/playlist.module.css';
import minusIcon from '../../../assets/images/minus.svg';

function Playlist(props) {

    return (
        <form className={styles.playlist}>
            <h2 className={styles.h2}>
                <input
                    type="text"
                    className={styles.playlistNameInput}
                    value={props.playlistName}
                    onChange={(e) => props.onUpdatePlaylistName(e.target.value)}
                />
            </h2>
            <div className={styles.playlistList}>
                {props.playlistTracks.length > 0
                    ? props.playlistTracks.map((track) => (
                        <div key={track.id} className={styles.playlistItemContainer}>
                            <div className={styles.playlistItem}>
                                <p>{track.name}</p>
                                <p>{track.artist}</p>
                            </div>
                            <div>
                                <button
                                    className={styles.removeButton}
                                    type="button"
                                    aria-label={`Remove ${track.name} from playlist`}
                                    onClick={() => props.onRemoveTrack(track)}
                                >
                                    <img
                                        src={minusIcon}
                                        alt=""
                                        aria-hidden="true"
                                        className={styles.removeIcon}
                                    />
                                </button>
                            </div>
                        </div>
                    ))
                    : <p>No tracks added</p>
                }
                <button
                    className={styles.saveButton}
                    type="button"
                    aria-label="Save playlist"
                    onClick={props.onSubmitPlaylist}
                    disabled={props.playlistTracks.length === 0}
                >
                    Save to Spotify
                </button>
            </div>
        </form>
    );
}

export default Playlist;
