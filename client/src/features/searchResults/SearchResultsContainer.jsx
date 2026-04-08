import { useEffect, useState } from 'react';
import SearchResults from './SearchResults';
import styles from '../styles/searchResults.module.css';
import { Spotify } from '../../util/spotify/index';

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
        const fetchResults = async () => {
            if (!props.submittedSearchTerm) {
                setSearchResults([]);
                return;
            }

            const results = await Spotify.search(props.submittedSearchTerm);
            const { tracks } = results;
            setSearchResults(tracks || []);
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