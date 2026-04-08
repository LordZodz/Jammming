import styles from '../styles/searchResults.module.css';
import TracklistContainer from '../tracklist/TracklistContainer';

/**
 * This presentation component is responsible for rendering the search results in the application. 
 * It will display the search results based on the data received from the Spotify API.
 * 
 * @returns {JSX.Element} The rendered SearchResults component.
 */

function SearchResults(props) {

    return (
        <div className={styles.searchResults}>
            <h2 className={styles.h2}>Search Results</h2>
            <div className={styles.resultsList}>
                {props.searchResults.length === 0 ? (
                    <p className={styles.noResults}>No search results found. Please try a different search term.</p>
                ) : (
                    <TracklistContainer
                        tracklist={props.searchResults}
                        listType='searchResults'
                        onAddSelectedTrack={props.onAddSelectedTrack}
                    />
                )}
            </div>
        </div>
    );
};

export default SearchResults;