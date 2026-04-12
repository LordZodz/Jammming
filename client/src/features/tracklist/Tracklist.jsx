import styles from './tracklist.module.css';
import Track from '../track/Track';

/** 
 * This presentation component is responsible for rendering a list of tracks in the application. 
 * It receives the list of tracks as props and displays them in a structured format.
 * Each track is rendered using the Track component, which is responsible for displaying individual track details.
 * 
 * @returns {JSX.Element} The rendered TrackList component.
 */

function Tracklist(props) {
    return (
        <div className={props.listType === 'playlistTracks' ? styles.playlistTracklist : styles.searchResulttracklist}>
            {props.tracks.length > 0 && (
                props.tracks.map((track) => (
                    <Track
                        key={track.id}
                        track={track}
                        listType={props.listType}
                        onAddSelectedTrack={props.onAddSelectedTrack}
                        onRemovePlaylistTrack={props.onRemovePlaylistTrack}
                        onPlayTrack={props.onPlayTrack}
                    />
                ))
            )}
        </div>
    );
};

export default Tracklist;