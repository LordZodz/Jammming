import { useState, useEffect } from 'react';
import Header from '../features/header/Header';
import SearchBarContainer from '../features/searchBar/SearchBarContainer';
import SearchResultsContainer from '../features/searchResults/SearchResultsContainer';
import PlaylistContainer from '../features/playlist/PlaylistContainer';
import styles from './app.module.css';
import Login from '../features/login/Login';
import { AUTH_TOKEN } from '../utils/api_spotify/spotify';

/**
 * This is the main App component of the React application.
 * It serves as the root component for the application and renders the main UI.
 * 
 * @returns {JSX.Element} The rendered App component.
 */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const backendTokenUrl = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_TOKEN}`;

        const response = await fetch(backendTokenUrl, { credentials: 'include' });
        if (!response.ok) {
          console.error('No valid session on server:', response.statusText);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        // If the server is down or there is a network error, log the error and allow the app to render the login screen
        if (error instanceof TypeError) {
          console.error('Network error while fetching access token. Server may be down:', error);
        } else {
          console.error('Error fetching access token:', error);
        };
      }
    };

    getToken();
  }, []);

  const handleAddSelectedTrack = (track) => {
    setSelectedTrack(track);
  };

  const handleClearSelectedTrack = () => {
    setSelectedTrack(null);
  };

  const handleSearch = (term) => {
    setSubmittedSearchTerm(term);
  };

  return (
    <div className={styles.app}>
      <Header />
      {!isAuthenticated
        ? <Login />
        : <>
          <SearchBarContainer onSearch={handleSearch} />
          <div className={styles.resultsContent}>
            <SearchResultsContainer
              submittedSearchTerm={submittedSearchTerm}
              onAddSelectedTrack={handleAddSelectedTrack}
            />
            <PlaylistContainer
              selectedTrack={selectedTrack}
              onClearSelectedTrack={handleClearSelectedTrack}
            />
          </div>
        </>
      }
    </div>
  )
}

export default App;
