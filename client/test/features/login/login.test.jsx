import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../../src/features/login/Login';

vi.mock('../../../src/utils/api_spotify/spotify', () => ({
	AUTH_LOGIN: '/auth/login',
}));

describe('Login', () => {
	beforeEach(() => {
		// jsdom doesn't support navigation, so stub location assignment
		vi.stubGlobal('location', { href: '' });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('renders a login button with accessible label', () => {
		render(<Login />);

		expect(screen.getByRole('button', { name: 'Login with Spotify' })).toBeInTheDocument();
	});

	test('button displays the correct text', () => {
		render(<Login />);

		expect(screen.getByRole('button')).toHaveTextContent('Login with Spotify');
	});

	test('clicking the button navigates to the server auth login URL', () => {
		vi.stubGlobal('import.meta', { env: { VITE_SERVER_BASE_URL: 'http://127.0.0.1:3000' } });
		render(<Login />);

		fireEvent.click(screen.getByRole('button', { name: 'Login with Spotify' }));

		expect(window.location.href).toBe('http://127.0.0.1:3000/auth/login');
	});
});
