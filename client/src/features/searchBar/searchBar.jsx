import styles from './searchBar.module.css';

/**
 * This presentation component is responsible for rendering the search bar in the application. 
 * It allows users to input a search term and trigger a search action when the form is submitted.
 * 
 * @returns {JSX.Element} The rendered SearchBar component.
 */

function SearchBar(props) {

    return (
        <div className={styles.searchBar}>
            <form
                id="searchBarForm"
                name='searchBarForm'
                className={styles.searchForm}
                onSubmit={props.handleSubmit}
                >
                <input
                    className={styles.searchInput}
                    placeholder="Enter A Song, Album, or Artist"
                    value={props.searchTerm}
                    onChange={(e) => props.setSearchTerm(e.target.value)}
                />
                <button
                    className={styles.searchButton}
                    type="submit"
                    aria-label="Search"
                    disabled={!props.searchTerm.trim()}
                >
                    SEARCH
                </button>
            </form>
        </div>
    );
};

export default SearchBar;