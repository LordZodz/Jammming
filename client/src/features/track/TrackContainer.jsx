import { useState, useEffect } from 'react';
import Track from './Track';

/** 
 * This container component is responsible for managing the state and logic related to a single track in the application. 
 * It will handle the data received from the Spotify API and pass it down to the Track presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered TrackContainer component.
 */

function TrackContainer(props) {
    const [track, setTrack] = useState({});

    // When the component receives new track information through props, update the local state to reflect the new track data.
    useEffect(() => {
        setTrack(props.trackInfo);
    }, [props.trackInfo]);

    return (
        <Track
            id={track.id}
            name={track.name}
            artist={track.artist}
            album={track.album}
            image={track.image}
            uri={track.uri}
            listType={props.listType}
            onAddSelectedTrack={props.onAddSelectedTrack}
            onRemovePlaylistTrack={props.onRemovePlaylistTrack}
        />
    );
};

export default TrackContainer;