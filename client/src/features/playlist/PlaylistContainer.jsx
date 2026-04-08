import { useState, useEffect } from 'react';
import Playlist from './Playlist';
import styles from '../styles/playlist.module.css';
import { Spotify } from '../../util/spotify/index';

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

    const handleUpdatePlaylistName = (name) => {
        setPlaylistName(name);
    };

    const handleRemoveTrack = (trackToRemove) => {
        setPlaylistTracks((prev) => prev.filter((item) => item.id !== trackToRemove.id));
    };

    /** Implement most of the functionality for creating an array of uris from the playlist tracks, 
     *  sending that array and the playlist name to the Spotify API, 
     * and then resetting the playlist name and tracks back to their default states. 
     * 
    */
    const handleSubmitPlaylist = async () => {
        const trackUris = playlistTracks.map((track) => track.uri);
        
        if (!playlistName || trackUris.length === 0) {
            alert('Please enter a playlist name and add at least one track before submitting.');
            return;
        };

        const response = await Spotify.savePlaylist(playlistName, trackUris);

        if (response.ok) {
            alert('Playlist saved successfully!');
            handleClearPlaylist();
        } else {
            alert('There was an error saving your playlist. Please try again.');
        };
    };

    const handleClearPlaylist = () => {
        setPlaylistName('');
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
