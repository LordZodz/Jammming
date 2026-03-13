import React, { useState } from 'react';
import Header from '../features/header/components/Header';
import SearchBarContainer from '../features/searchBar/containers/SearchBarContainer';
import SearchResultsContainer from '../features/searchResults/container/SearchResultsContainer';
import PlaylistContainer from '../features/playlist/container/PlaylistContainer';
import styles from './app.module.css';

/**
 * This is the main App component of the React application.
 * It serves as the root component for the application and renders the main UI.
 * 
 * @returns {JSX.Element} The rendered App component.
 */

function App() {
  const [selectedTrack, setSelectedTrack] = useState(null);

  function handleAddSelectedTrack(track) {
    setSelectedTrack(track);
  };

  function handleClearSelectedTrack() {
    setSelectedTrack(null);
  };

  return (
    <div className={styles.app}>
      <Header />
      <SearchBarContainer />
      <div className={styles.resultsContent}>
        <SearchResultsContainer
          onAddSelectedTrack={handleAddSelectedTrack}
        />
        <PlaylistContainer
          selectedTrack={selectedTrack}
          onClearSelectedTrack={handleClearSelectedTrack}
        />
      </div>
    </div>
  )
}

export default App
