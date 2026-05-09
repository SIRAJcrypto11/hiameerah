import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SearchBar – rendering', () => {
  it('renders a search landmark (role="search")', () => {
    render(<SearchBar />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search products…');
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="Find a hijab…" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Find a hijab…');
  });

  it('does not render the clear button when input is empty', () => {
    render(<SearchBar />);
    expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument();
  });

  it('renders the clear button when input has a value (controlled)', () => {
    render(<SearchBar value="hijab" />);
    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
  });

  it('renders the clear button when input has a defaultValue (uncontrolled)', () => {
    render(<SearchBar defaultValue="hijab" />);
    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
  });

  it('applies custom className to the wrapper', () => {
    const { container } = render(<SearchBar className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders with custom aria-label', () => {
    render(<SearchBar aria-label="Search products" />);
    expect(screen.getByRole('search')).toHaveAttribute('aria-label', 'Search products');
  });
});

// ─── Uncontrolled mode ────────────────────────────────────────────────────────

describe('SearchBar – uncontrolled mode', () => {
  it('starts with empty value by default', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('starts with defaultValue when provided', () => {
    render(<SearchBar defaultValue="satin" />);
    expect(screen.getByRole('searchbox')).toHaveValue('satin');
  });

  it('updates internal value on user input', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'hijab');
    expect(input).toHaveValue('hijab');
  });

  it('shows clear button after typing', async () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'a');
    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
  });

  it('clears the input when clear button is clicked', async () => {
    render(<SearchBar defaultValue="hijab" />);
    const clearBtn = screen.getByTestId('search-clear-button');
    await userEvent.click(clearBtn);
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument();
  });
});

// ─── Controlled mode ──────────────────────────────────────────────────────────

describe('SearchBar – controlled mode', () => {
  it('reflects the controlled value', () => {
    render(<SearchBar value="pastel" onChange={() => {}} />);
    expect(screen.getByRole('searchbox')).toHaveValue('pastel');
  });

  it('calls onChange on every keystroke', async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'h');
    expect(onChange).toHaveBeenCalledWith('h');
  });

  it('does not update internal state in controlled mode', () => {
    const onChange = vi.fn();
    render(<SearchBar value="fixed" onChange={onChange} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'changed' } });
    // Value stays at "fixed" because parent controls it
    expect(input).toHaveValue('fixed');
  });
});

// ─── Debounced onSearch (Requirement 12.2) ────────────────────────────────────

describe('SearchBar – debounced onSearch (Req 12.2)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call onSearch immediately on input', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hi' } });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch after 300ms of inactivity', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hijab' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('hijab');
  });

  it('does not call onSearch before 300ms', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'hijab' } });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('resets the debounce timer on each keystroke', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'h' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.change(input, { target: { value: 'hi' } });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Still not called – last keystroke was only 200ms ago
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Now 300ms have passed since the last keystroke
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('hi');
  });

  it('calls onSearch only once for rapid typing', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');

    ['h', 'hi', 'hij', 'hija', 'hijab'].forEach((val) => {
      fireEvent.change(input, { target: { value: val } });
      act(() => {
        vi.advanceTimersByTime(50);
      });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('hijab');
  });

  it('supports custom debounceMs', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={500} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onSearch).toHaveBeenCalledOnce();
  });
});

// ─── Clear button ─────────────────────────────────────────────────────────────

describe('SearchBar – clear button', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onClear when clear button is clicked', async () => {
    vi.useRealTimers();
    const onClear = vi.fn();
    render(<SearchBar defaultValue="hijab" onClear={onClear} />);
    await userEvent.click(screen.getByTestId('search-clear-button'));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('calls onSearch with empty string when cleared', () => {
    const onSearch = vi.fn();
    render(<SearchBar defaultValue="hijab" onSearch={onSearch} />);
    fireEvent.click(screen.getByTestId('search-clear-button'));
    // onSearch is called immediately on clear (no debounce)
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('calls onChange with empty string when cleared', () => {
    const onChange = vi.fn();
    render(<SearchBar defaultValue="hijab" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('search-clear-button'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('cancels pending debounced search when cleared', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'hijab' } });
    // Clear before debounce fires
    fireEvent.click(screen.getByTestId('search-clear-button'));

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // onSearch should have been called once (from clear), not twice
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('clear button has accessible aria-label', () => {
    render(<SearchBar defaultValue="hijab" />);
    expect(screen.getByTestId('search-clear-button')).toHaveAttribute('aria-label', 'Clear search');
  });
});

// ─── Keyboard support ─────────────────────────────────────────────────────────

describe('SearchBar – keyboard support', () => {
  it('clears the input when Escape is pressed and input has value', async () => {
    render(<SearchBar defaultValue="hijab" />);
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('');
  });

  it('does nothing on Escape when input is empty', () => {
    const onClear = vi.fn();
    render(<SearchBar onClear={onClear} />);
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClear).not.toHaveBeenCalled();
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('SearchBar – disabled state', () => {
  it('disables the input when disabled=true', () => {
    render(<SearchBar disabled />);
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });

  it('disables the clear button when disabled=true', () => {
    render(<SearchBar defaultValue="hijab" disabled />);
    expect(screen.getByTestId('search-clear-button')).toBeDisabled();
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('SearchBar – accessibility', () => {
  it('has role="search" on the wrapper', () => {
    render(<SearchBar />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('input has aria-label', () => {
    render(<SearchBar aria-label="Search products" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search products');
  });

  it('clear button is a button element', () => {
    render(<SearchBar defaultValue="test" />);
    const btn = screen.getByTestId('search-clear-button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });
});

// ─── Responsive layout ────────────────────────────────────────────────────────

describe('SearchBar – responsive layout', () => {
  it('wrapper has w-full class for mobile', () => {
    const { container } = render(<SearchBar />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('wrapper has sm:w-80 class for desktop fixed width', () => {
    const { container } = render(<SearchBar />);
    expect(container.firstChild).toHaveClass('sm:w-80');
  });
});
