import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

/** 
 * This container component is responsible for managing the state and logic of the SearchBar component.
 * It will handle user input, manage the search term state, and trigger search actions when the form is submitted.
 * 
 * @returns {JSX.Element} The rendered SearchBar component with its associated logic.
 */

function SearchBarContainer() {
    const [searchTerm, setSearchTerm] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        // temporary alert to show the search term when the form is submitted
        // TODO: replace this with actual search functionality that interacts with the Spotify API
        alert(`Searching for: ${searchTerm}`);
    };

    return (
        <div>
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default SearchBarContainer;