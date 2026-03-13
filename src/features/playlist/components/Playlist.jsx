import styles from '../styles/playlist.module.css';
import minusIcon from '../../../assets/images/minus.svg';
import TracklistContainer from '../../tracklist/containers/TracklistContainer';

function Playlist(props) {

    return (
        <form className={styles.playlist}>
            <h2 className={styles.h2}>
                <input
                    type="text"
                    className={styles.playlistNameInput}
                    value={props.playlistName}
                    placeholder='Type playlist name'
                    onChange={(e) => props.onUpdatePlaylistName(e.target.value)}
                />
            </h2>
            <div className={styles.playlistList}>
                {props.playlistTracks.length === 0 ? (
                    <p className={styles.noTracks}>No tracks in playlist. Please add some tracks from the search results.</p>
                ) : (
                    <TracklistContainer
                        tracklist={props.playlistTracks}
                        listType={props.listType}
                        onRemovePlaylistTrack={props.onRemovePlaylistTrack}
                    />
                )}
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
