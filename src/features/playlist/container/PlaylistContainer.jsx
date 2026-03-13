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

    /** Implement most of the functionality for creating an array of uris from the playlist tracks, 
     *  sending that array and the playlist name to the Spotify API, 
     * and then resetting the playlist name and tracks back to their default states. 
     * 
    */
    function handleSubmitPlaylist() {
        const trackUris = playlistTracks.map((track) => track.uri);
        
        if (!playlistName || trackUris.length === 0) {
            alert('Please enter a playlist name and add at least one track before submitting.');
            return;
        };
        
        console.log('Submitting playlist:', playlistName, trackUris);
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
