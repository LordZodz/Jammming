import { useState } from 'react';
import SearchResults from '../components/SearchResults';
import styles from '../styles/searchResults.module.css';

/**
 * This container component is responsible for managing the state and logic related to the search results in the application. 
 * It will handle the data received from the Spotify API and pass it down to the SearchResults presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered SearchResultsContainer component.
 */

function SearchResultsContainer(props) {
    const [searchResults, setSearchResults] = useState([]);

    /* Temporary mock data for search results */
    const [mockSearchResults] = useState([
        { id: '1', name: 'Song 1', artist: 'Artist 1' },
        { id: '2', name: 'Song 2', artist: 'Artist 2' },
        { id: '3', name: 'Song 3', artist: 'Artist 3' },
    ]);

    return (
        <div className={styles.searchResultsContainer}>
            <SearchResults
                searchResults={mockSearchResults}
                onAddSelectedTrack={props.onAddSelectedTrack}
            />
        </div>
    );
};

export default SearchResultsContainer;