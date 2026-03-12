import React, { useState } from 'react';
import styles from './styles/SearchBar.module.css';

/**
 * This presentation component is responsible for rendering the search bar in the application. 
 * It allows users to input a search term and trigger a search action when the form is submitted.
 * 
 * @returns {JSX.Element} The rendered SearchBar component.
 */

function SearchBar() {

    return (
        <div className={styles.SearchBar}>
            <input placeholder="Enter A Song, Album, or Artist" />
            <button className={styles.SearchButton}>SEARCH</button>
        </div>
    );
};

export default SearchBar;