import { useState, useEffect } from 'react';
import Header from '../features/header/Header';
import SearchBarContainer from '../features/searchBar/SearchBarContainer';
import SearchResultsContainer from '../features/searchResults/SearchResultsContainer';
import PlaylistContainer from '../features/playlist/PlaylistContainer';
import WebPlayerContainer from '../features/webPlayer/WebPlayerContainer';
import styles from './app.module.css';
import Login from '../features/login/Login';
import { AUTH_TOKEN, Spotify } from '../utils/api_spotify/spotify';

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
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            try {
                const backendTokenUrl = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_TOKEN}`;

                const response = await fetch(backendTokenUrl, { credentials: 'include' });
                if (!response.ok) {
                    console.error('No valid session on server:', response.ok);
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

    const handleDeviceReady = (id) => {
        setDeviceId(id);
    };

    const handlePlayTrack = async (uri) => {
        if (!deviceId) {
            console.warn('No playback device available. Transfer playback to Jammming Web Player first.');
            return;
        }
        const result = await Spotify.playTrack(deviceId, uri);
        if (!result.ok) {
            console.error('Failed to play track:', result.error);
        }
    };

    return (
        <div className={styles.appContainer}>
            {!isAuthenticated
                ? <Login />
                : <>
                    <Header />
                    <div className={styles.mainContainer}>
                        <div className={styles.searchBarContainer}>
                            <SearchBarContainer onSearch={handleSearch} />
                        </div>
                        <div className={styles.resultsContainer}>
                            <SearchResultsContainer
                                submittedSearchTerm={submittedSearchTerm}
                                onAddSelectedTrack={handleAddSelectedTrack}
                                onPlayTrack={handlePlayTrack}
                            />
                            <PlaylistContainer
                                selectedTrack={selectedTrack}
                                onClearSelectedTrack={handleClearSelectedTrack}
                            />
                        </div>
                        <div className={styles.webPlayerContainer}>
                            <WebPlayerContainer onDeviceReady={handleDeviceReady} />
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default App;
