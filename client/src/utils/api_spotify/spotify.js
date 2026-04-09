import { search, savePlaylist, playTrack, setRepeat } from './api';

const AUTH_LOGIN = "/auth/login";
const AUTH_TOKEN = "/auth/token";

const Spotify = {
    search,
    savePlaylist,
    playTrack,
    setRepeat,
};

export { 
    Spotify,
    AUTH_LOGIN,
    AUTH_TOKEN, 
};