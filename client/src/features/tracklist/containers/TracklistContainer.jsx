import { useState, useEffect } from 'react';
import Tracklist from '../components/Tracklist';

/** 
 * This container component is responsible for managing the state and logic related to the tracklist in the application.
 * It will handle the data received from the Spotify API and pass it down to the Tracklist presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered TracklistContainer component.
 */

function TracklistContainer(props) {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        setTracks(props.tracklist);
    }, [props.tracklist]);

    return (
        <Tracklist
            tracks={tracks}
            listType={props.listType}
            onAddSelectedTrack={props.onAddSelectedTrack}
            onRemovePlaylistTrack={props.onRemovePlaylistTrack}
        />
    );
};

export default TracklistContainer;