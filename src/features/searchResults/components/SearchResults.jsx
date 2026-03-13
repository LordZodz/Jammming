import styles from '../styles/searchResults.module.css';
import plusIcon from '../../../assets/images/plus.svg';

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
                {props.searchResults.length > 0
                    ? (props.searchResults.map((result) => (
                        <div key={result.id} className={styles.resultItemContainer}>
                            <div className={styles.resultItem}>
                                <p>{result.name}</p>
                                <p>{result.artist}</p>
                            </div>
                            <div>
                                <button
                                    className={styles.addButton}
                                    type="button"
                                    aria-label={`Add ${result.name} to playlist`}
                                    onClick={() => props.onAddSelectedTrack(result)}
                                >
                                    <img
                                        src={plusIcon}
                                        alt=""
                                        aria-hidden="true"
                                        className={styles.addIcon}
                                    />
                                </button>
                            </div>
                        </div>

                    ))
                    ) : (
                        <p>No results found</p>
                    )}
            </div>
        </div>
    );
};

export default SearchResults;