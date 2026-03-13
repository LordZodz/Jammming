import { useState, useEffect } from 'react';
import Playlist from '../components/Playlist';
import styles from '../styles/playlist.module.css';

function PlaylistContainer(props) {
    const [playlistName, setPlaylistName] = useState('');
    const [playlistTracks, setPlaylistTracks] = useState([]);
    const listType = 'playlistTracks';

    // When a new track is selected from the search results, add it to the playlist if it's not already there.
    useEffect(() => {
        if (props.selectedTrack) {
            setPlaylistTracks((prev) => {
                const alreadyAdded = prev.some((item) => item.id === props.selectedTrack.id);
                return alreadyAdded ? prev : [...prev, props.selectedTrack];
            });
            props.onClearSelectedTrack();
        }
    }, [props.selectedTrack]);

    function handleUpdatePlaylistName(name) {
        setPlaylistName(name);
    };

    function handleRemoveTrack(trackToRemove) {
        setPlaylistTracks((prev) => prev.filter((item) => item.id !== trackToRemove.id));
    };

    function handleSubmitPlaylist() {
        alert('Save playlist functionality not implemented yet');
        handleClearPlaylist();
    };

    function handleClearPlaylist() {
        setPlaylistName('New Playlist');
        playlistTracks.forEach((track) => handleRemoveTrack(track));
        setPlaylistTracks([]);
    };

    return (
        <div className={styles.playlistContainer}>
            <Playlist
                playlistName={playlistName}
                playlistTracks={playlistTracks}
                listType={listType}
                onUpdatePlaylistName={handleUpdatePlaylistName}
                onRemovePlaylistTrack={handleRemoveTrack}
                onSubmitPlaylist={handleSubmitPlaylist}
            />
        </div>
    );
}

export default PlaylistContainer;
