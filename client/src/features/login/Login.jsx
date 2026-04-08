import styles from './login.module.css';

const Login = (props) => {

    return (
        <div className={styles.loginContainer}>
            <button 
                onClick={props.onLoginClick}
                className={styles.loginButton}
                aria-label="Login with Spotify"
            >
                Login with Spotify
            </button>
        </div>
    );
};

export default Login;