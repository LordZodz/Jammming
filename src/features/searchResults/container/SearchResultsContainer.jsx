import { useEffect, useState } from 'react';
import SearchResults from '../components/SearchResults';
import styles from '../styles/searchResults.module.css';
import { Spotify } from '../../../util/Spotify/Spotify';

/**
 * This container component is responsible for managing the state and logic related to the search results in the application. 
 * It will handle the data received from the Spotify API and pass it down to the SearchResults presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered SearchResultsContainer component.
 */

function SearchResultsContainer(props) {
    const [searchResults, setSearchResults] = useState([]);
    const listType = 'searchResults';

    useEffect(() => {
        async function fetchResults() {
            if (!props.submittedSearchTerm) {
                setSearchResults([]);
                return;
            }

            const results = await Spotify.search(props.submittedSearchTerm);
            setSearchResults(results);
            console.log('Fetched search results:', results);
        };

        fetchResults();
    }, [props.submittedSearchTerm]);

    return (
        <div className={styles.searchResultsContainer}>
            <SearchResults
                searchResults={searchResults}
                listType={listType}
                onAddSelectedTrack={props.onAddSelectedTrack}
            />
        </div>
    );
};

export default SearchResultsContainer;