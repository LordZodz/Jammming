import React, { useState, useEffect } from 'react';
import Playlist from '../components/Playlist';
import styles from '../styles/playlist.module.css';

function PlaylistContainer(props) {
    const [playlistName, setPlaylistName] = useState('New Playlist');
    const [playlistTracks, setPlaylistTracks] = useState([]);

    function handleUpdatePlaylistName(name) {
        setPlaylistName(name);
    };

    /** This useEffect hook listens for changes to the selectedTrack prop. 
     * When a new track is selected, it checks if the track is already in the playlistTracks state. 
     * If it's not already added, it adds the new track to the playlistTracks array. 
     * This ensures that the playlist is updated whenever a new track is selected from the search results.
     * If the track is already in the playlist, it prevents adding duplicates.
     * It then clears the selected track in the parent component to avoid unintended side effects.
    */
    useEffect(() => {
        if (props.selectedTrack) {
            setPlaylistTracks((prev) => {
                const alreadyAdded = prev.some((item) => item.id === props.selectedTrack.id);
                return alreadyAdded ? prev : [...prev, props.selectedTrack];
            });
            props.onClearSelectedTrack();
        }
    }, [props.selectedTrack]);

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
                onRemoveTrack={handleRemoveTrack}
                onUpdatePlaylistName={handleUpdatePlaylistName}
                onSubmitPlaylist={handleSubmitPlaylist}
            />
        </div>
    );
}

export default PlaylistContainer;
