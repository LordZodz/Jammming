import { useState, useEffect } from 'react';
import Header from '../features/header/Header';
import SearchBarContainer from '../features/searchBar/SearchBarContainer';
import SearchResultsContainer from '../features/searchResults/SearchResultsContainer';
import PlaylistContainer from '../features/playlist/PlaylistContainer';
import styles from './app.module.css';
import LoginContainer from '../features/login/LoginContainer';
import { AUTH_TOKEN } from '../util/config/spotifyConfig';

/**
 * This is the main App component of the React application.
 * It serves as the root component for the application and renders the main UI.
 * 
 * @returns {JSX.Element} The rendered App component.
 */

function App() {
  const [token, setToken] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const backendTokenUrl = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_TOKEN}`;

        const response = await fetch(backendTokenUrl);
        const json = await response.json();

        // console.log('Token response status:', response.status);
        // console.log('Token response JSON:', json);

        if (!response.ok) {
          console.error('Failed to fetch access token from server:', json);
          return;
        }

        setToken(json.access_token);
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
      {(token === '')
        ? <LoginContainer token={token} />
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
