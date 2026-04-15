import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../../../src/features/searchBar/searchBar';

const placeholder = 'Enter A Song, Album, or Artist';

describe('SearchBar', () => {
    let setSearchTerm;
    let handleSubmit;

    const renderSearchBar = (overrideProps = {}) => render(
        <SearchBar
            searchTerm=""
            setSearchTerm={setSearchTerm}
            handleSubmit={handleSubmit}
            {...overrideProps}
        />
    );

    beforeEach(() => {
        setSearchTerm = vi.fn();
        handleSubmit = vi.fn((e) => e.preventDefault());
    });

    test('renders input with placeholder text', () => {
        renderSearchBar();

        expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    test('renders controlled input value from searchTerm prop', () => {
        renderSearchBar({ searchTerm: 'Numb' });

        expect(screen.getByPlaceholderText(placeholder)).toHaveValue('Numb');
    });

    test('calls setSearchTerm with input value on change', () => {
        renderSearchBar();

        fireEvent.change(screen.getByPlaceholderText(placeholder), {
            target: { value: 'Bohemian Rhapsody' },
        });

        expect(setSearchTerm).toHaveBeenCalledWith('Bohemian Rhapsody');
    });

    test('disables submit button when searchTerm is empty or whitespace', () => {
        const { rerender } = renderSearchBar();

        expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();

        rerender(
            <SearchBar
                searchTerm="   "
                setSearchTerm={setSearchTerm}
                handleSubmit={handleSubmit}
            />
        );

        expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    });

    test('enables submit button when searchTerm has non-whitespace text', () => {
        renderSearchBar({ searchTerm: 'Muse' });

        expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
    });

    test('calls handleSubmit when form is submitted', () => {
        renderSearchBar({ searchTerm: 'Muse' });

        fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form'));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
});
