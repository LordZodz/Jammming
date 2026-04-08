import styles from './login.module.css';
import { AUTH_LOGIN } from '../../utils/api_spotify/spotify';

function Login() {
    const handleLoginClick = () => {
        window.location.href = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_LOGIN}`;
    };

    return (
        <div className={styles.loginContainer}>
            <button 
                onClick={handleLoginClick}
                className={styles.loginButton}
                aria-label="Login with Spotify"
            >
                Login with Spotify
            </button>
        </div>
    );
}

export default Login;