import React, { useState } from 'react';
import Track from '../components/Track';

/** 
 * This container component is responsible for managing the state and logic related to a single track in the application. 
 * It will handle the data received from the Spotify API and pass it down to the Track presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered TrackContainer component.
 */

function TrackContainer(props) {
    const [track, setTrack] = useState({
        id: props.id,
        name: props.name,
        artist: props.artist,
        album: props.album,
        listType: props.listType
    });

    return (
        <Track
            id={track.id}
            name={track.name}
            artist={track.artist}
            album={track.album}
            listType={track.listType}
            onAddSelectedTrack={props.onAddSelectedTrack}
            onRemovePlaylistTrack={props.onRemovePlaylistTrack}
        />
    );
};

export default TrackContainer;