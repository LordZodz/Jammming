import { useRef } from 'react';
import styles from './playlist.module.css';
import Tracklist from '../tracklist/Tracklist';

function Playlist(props) {

    const groupRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && props.playlistName.trim()) {
            groupRef.current?.classList.add(styles.playlistInputGroupPressed);
            setTimeout(() => {
                groupRef.current?.classList.remove(styles.playlistInputGroupPressed);
            }, 150);
        }
    };

    return (
        <div className={styles.playlistContainer}>
            <form className={styles.playlist}>
                <div ref={groupRef} className={styles.playlistInputGroup}>
                    <input
                        type="text"
                        className={styles.playlistNameInput}
                        value={props.playlistName}
                        placeholder='Type playlist name'
                        onChange={(e) => props.onUpdatePlaylistName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className={styles.saveButton}
                        type="button"
                        aria-label="Save playlist"
                        onClick={props.onSubmitPlaylist}
                        disabled={props.playlistTracks.length === 0 || !props.playlistName.trim()}
                    >
                        Save to Spotify
                    </button>
                </div>
                <div className={styles.playlistList}>
                    {props.playlistTracks.length === 0 ? (
                        <p className={styles.noTracks}>No tracks in playlist. Please add some tracks from the search results.</p>
                    ) : (
                        <Tracklist
                            tracks={props.playlistTracks}
                            listType={props.listType}
                            onRemovePlaylistTrack={props.onRemovePlaylistTrack}
                        />
                    )}
                </div>
            </form>
        </div>
    );
}

export default Playlist;
