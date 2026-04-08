import Login from './components/Login';
import { AUTH_LOGIN } from '../../util/config/spotifyConfig';

const LoginContainer = () => {
    const handleLoginClick = () => {
        const backendAuthUrl = `${import.meta.env.VITE_SERVER_BASE_URL}${AUTH_LOGIN}`;
        window.location.href = backendAuthUrl;
    };

    return (
        <div>
            <Login onLoginClick={handleLoginClick} />
        </div>
    );
};

export default LoginContainer;