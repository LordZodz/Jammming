import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBarContainer from '../../../src/features/searchBar/SearchBarContainer';

describe('SearchBarContainer', () => {
	let onSearch;

	beforeEach(() => {
		onSearch = vi.fn();
	});

	test('renders SearchBar input and button', () => {
		render(<SearchBarContainer onSearch={onSearch} />);

		expect(screen.getByPlaceholderText('Enter A Song, Album, or Artist')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
	});

	test('updates input value as user types', () => {
		render(<SearchBarContainer onSearch={onSearch} />);

		const input = screen.getByPlaceholderText('Enter A Song, Album, or Artist');
		fireEvent.change(input, { target: { value: 'Radiohead' } });

		expect(input).toHaveValue('Radiohead');
	});

	test('submits trimmed search term', () => {
		render(<SearchBarContainer onSearch={onSearch} />);

		const input = screen.getByPlaceholderText('Enter A Song, Album, or Artist');
		fireEvent.change(input, { target: { value: '   Arcade Fire   ' } });

		const form = screen.getByRole('button', { name: /search/i }).closest('form');
		fireEvent.submit(form);

		expect(onSearch).toHaveBeenCalledTimes(1);
		expect(onSearch).toHaveBeenCalledWith('Arcade Fire');
	});

	test('keeps submit button disabled for whitespace-only input', () => {
		render(<SearchBarContainer onSearch={onSearch} />);

		const input = screen.getByPlaceholderText('Enter A Song, Album, or Artist');
		fireEvent.change(input, { target: { value: '     ' } });

		expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
	});
});
