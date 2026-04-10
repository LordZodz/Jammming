import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../../src/features/header/Header';

describe('Header', () => {
	test('renders a header landmark element', () => {
		render(<Header />);

		expect(screen.getByRole('banner')).toBeInTheDocument();
	});

	test('renders the app name as a heading', () => {
		render(<Header />);

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});

	test('heading displays the full app name "Jammming"', () => {
		render(<Header />);

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jammming');
	});
});
