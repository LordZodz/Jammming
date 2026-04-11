import { useRef } from 'react';
import styles from './searchBar.module.css';

/**
 * This presentation component is responsible for rendering the search bar in the application. 
 * It allows users to input a search term and trigger a search action when the form is submitted.
 * 
 * @returns {JSX.Element} The rendered SearchBar component.
 */

function SearchBar(props) {
    const groupRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && props.searchTerm.trim()) {
            groupRef.current?.classList.add(styles.searchInputGroupPressed);
            setTimeout(() => {
                groupRef.current?.classList.remove(styles.searchInputGroupPressed);
            }, 150);
        }
    };

    return (
        <div className={styles.searchBar}>
            <form
                id="searchBarForm"
                name='searchBarForm'
                className={styles.searchForm}
                onSubmit={props.handleSubmit}
                >
                <div ref={groupRef} className={styles.searchInputGroup}>
                    <input
                        ref={props.inputRef}
                        className={styles.searchInput}
                        placeholder="Enter A Song, Album, or Artist"
                        value={props.searchTerm}
                        onChange={(e) => props.setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className={styles.searchButton}
                        type="submit"
                        aria-label="Search"
                        disabled={!props.searchTerm.trim()}
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;