import React from "react";
import styles from '../styles/header.module.css';

/**
 * This presentation component is responsible for rendering the header of the application. 
 * It displays the name of the application prominently at the top of the UI.
 * 
 * @returns {JSX.Element} The rendered Header component.
 */

function Header() {

    return (
        <header className={styles.header}>
            <h1 className={styles.title}>Ja<span className={styles.highlight}>mmm</span>ing</h1>
        </header>
    );
};

export default Header;