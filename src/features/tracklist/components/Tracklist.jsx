import styles from '../styles/tracklist.module.css';
import TrackContainer from '../../track/containers/TrackContainer';

/** 
 * This presentation component is responsible for rendering a list of tracks in the application. 
 * It receives the list of tracks as props and displays them in a structured format.
 * Each track is rendered using the Track component, which is responsible for displaying individual track details.
 * 
 * @returns {JSX.Element} The rendered TrackList component.
 */

function Tracklist(props) {
    return (
        <>
            {props.tracks.map((track) => (
                <TrackContainer
                    key={track.id}
                    id={track.id}
                    name={track.name}
                    artist={track.artist}
                    album={track.album}
                    listType={props.listType}
                    onAddSelectedTrack={props.onAddSelectedTrack}
                    onRemovePlaylistTrack={props.onRemovePlaylistTrack}
                />
            ))
        }
        </>
    );
};

export default Tracklist;