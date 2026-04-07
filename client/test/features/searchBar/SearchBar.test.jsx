import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../../../src/features/searchBar/components/SearchBar';

describe('SearchBar', () => {
	let setSearchTerm;
	let handleSubmit;

	const baseProps = {
		searchTerm: '',
		setSearchTerm: () => {},
		handleSubmit: () => {},
	};

	beforeEach(() => {
		setSearchTerm = vi.fn();
		handleSubmit = vi.fn((e) => e.preventDefault());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('renders input with placeholder text', () => {
		render(
			<SearchBar
				{...baseProps}
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		expect(
			screen.getByPlaceholderText('Enter A Song, Album, or Artist')
		).toBeInTheDocument();
	});

	test('renders controlled input value from searchTerm prop', () => {
		render(
			<SearchBar
				{...baseProps}
				searchTerm="Numb"
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		expect(screen.getByPlaceholderText('Enter A Song, Album, or Artist')).toHaveValue('Numb');
	});

	test('calls setSearchTerm with input value on change', () => {
		render(
			<SearchBar
				{...baseProps}
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Enter A Song, Album, or Artist'), {
			target: { value: 'Bohemian Rhapsody' },
		});

		expect(setSearchTerm).toHaveBeenCalledTimes(1);
		expect(setSearchTerm).toHaveBeenCalledWith('Bohemian Rhapsody');
	});

	test('disables submit button when searchTerm is empty or whitespace', () => {
		const { rerender } = render(
			<SearchBar
				{...baseProps}
				searchTerm=""
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();

		rerender(
			<SearchBar
				{...baseProps}
				searchTerm="   "
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
	});

	test('enables submit button when searchTerm has non-whitespace text', () => {
		render(
			<SearchBar
				{...baseProps}
				searchTerm="Muse"
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
	});

	test('calls handleSubmit when form is submitted', () => {
		render(
			<SearchBar
				{...baseProps}
				searchTerm="Muse"
				setSearchTerm={setSearchTerm}
				handleSubmit={handleSubmit}
			/>
		);

		fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form'));

		expect(handleSubmit).toHaveBeenCalledTimes(1);
	});
});
