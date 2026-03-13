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
  const [playlistTracks, setPlaylistTracks] = useState([]);

  function handleAddTrack(track) {
    console.log(track);
    setPlaylistTracks((prev) => {
      const alreadyAdded = prev.some((item) => item.id === track.id);
      return alreadyAdded ? prev : [...prev, track];
    });
  };

  function handleRemoveTrack(trackToRemove) {
    setPlaylistTracks((prev) => prev.filter((item) => item.id !== trackToRemove.id));
  };

  return (
    <div className={styles.app}>
      <Header />
      <SearchBarContainer />
      <div className={styles.resultsContent}>
        <SearchResultsContainer
          onAddTrack={handleAddTrack}
        />
        <PlaylistContainer
          playlistTracks={playlistTracks}
          onRemoveTrack={handleRemoveTrack}
        />
      </div>
    </div>
  )
}

export default App
