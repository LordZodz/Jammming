import { useState } from 'react';
import SearchBar from './searchBar';

/** 
 * This container component is responsible for managing the state and logic of the SearchBar component.
 * It will handle user input, manage the search term state, and trigger search actions when the form is submitted.
 * 
 * @returns {JSX.Element} The rendered SearchBar component with its associated logic.
 */

function SearchBarContainer(props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        props.onSearch(searchTerm.trim());
    };

    return (
        <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSubmit={handleSubmit}
        />
    );
};

export default SearchBarContainer;