import React, { useState } from 'react';
import Playlist from '../components/Playlist';
import styles from '../styles/playlist.module.css';

function PlaylistContainer(props) {
    const [playlistName, setPlaylistName] = useState('New Playlist');

    function handleUpdatePlaylistName(name) {
        setPlaylistName(name);
    };

    function handleSubmitPlaylist() {
        alert('Save playlist functionality not implemented yet');
        handleClearPlaylist();
    };

    function handleClearPlaylist() {
        setPlaylistName('New Playlist');
        props.playlistTracks.forEach((track) => props.onRemoveTrack(track));
    };

    return (
        <div className={styles.playlistContainer}>
            <Playlist
                playlistName={playlistName}
                playlistTracks={props.playlistTracks}
                onRemoveTrack={props.onRemoveTrack}
                onUpdatePlaylistName={handleUpdatePlaylistName}
                onSubmitPlaylist={handleSubmitPlaylist}
            />
        </div>
    );
}

export default PlaylistContainer;
