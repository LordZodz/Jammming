import { useEffect, useState } from 'react';
import SearchResults from './SearchResults';
import { Spotify } from '../../utils/api_spotify/spotify';

/**
 * This container component is responsible for managing the state and logic related to the search results in the application. 
 * It will handle the data received from the Spotify API and pass it down to the SearchResults presentation component for rendering.
 * 
 * @returns {JSX.Element} The rendered SearchResultsContainer component.
 */

function SearchResultsContainer(props) {
    const [searchResults, setSearchResults] = useState([]);

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
        <SearchResults
            searchResults={searchResults}
            onAddSelectedTrack={props.onAddSelectedTrack}
            onPlayTrack={props.onPlayTrack}
        />
    );
};

export default SearchResultsContainer;