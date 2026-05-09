import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  /**
   * Controlled value. When provided, the component operates in controlled mode.
   * When omitted, the component manages its own internal state (uncontrolled).
   */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Placeholder text for the search input */
  placeholder?: string;
  /**
   * Called after the user stops typing for 300ms (debounced).
   * Receives the current query string.
   * Requirement 12.2 – update suggestions within 300ms of last keystroke.
   */
  onSearch?: (query: string) => void;
  /** Called immediately when the clear button is clicked */
  onClear?: () => void;
  /**
   * Called on every keystroke (non-debounced).
   * Useful for controlled mode where the parent manages the value.
   */
  onChange?: (value: string) => void;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Accessible label for the search landmark */
  'aria-label'?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SearchBar molecule component.
 *
 * Provides a search input with:
 * - Search icon on the left
 * - Debounced onSearch callback (300ms) – Requirement 12.2
 * - Clear (×) button that appears when the input has a value
 * - Responsive layout: full-width on mobile, fixed width (320px) on desktop
 * - Accessible: role="search" landmark, aria-label, keyboard support
 *
 * Supports both controlled (value prop) and uncontrolled (defaultValue prop) modes.
 */
const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value: valueProp,
      defaultValue = '',
      placeholder = 'Search products…',
      onSearch,
      onClear,
      onChange,
      className,
      'aria-label': ariaLabel = 'Search',
      disabled = false,
      debounceMs = 300,
    },
    ref
  ) => {
    // ── Controlled vs uncontrolled ─────────────────────────────────────────
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? valueProp : internalValue;

    // ── Debounce timer ─────────────────────────────────────────────────────
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Update internal state in uncontrolled mode
        if (!isControlled) {
          setInternalValue(newValue);
        }

        // Notify parent of raw change immediately
        onChange?.(newValue);

        // Debounce the onSearch callback – Requirement 12.2
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onSearch?.(newValue);
        }, debounceMs);
      },
      [isControlled, onChange, onSearch, debounceMs]
    );

    const handleClear = useCallback(() => {
      // Cancel any pending debounced search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Update internal state in uncontrolled mode
      if (!isControlled) {
        setInternalValue('');
      }

      // Notify parent
      onChange?.('');
      onSearch?.('');
      onClear?.();
    }, [isControlled, onChange, onSearch, onClear]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && currentValue) {
          handleClear();
        }
      },
      [currentValue, handleClear]
    );

    // ── Render ─────────────────────────────────────────────────────────────
    const hasValue = Boolean(currentValue);

    return (
      <div
        role="search"
        aria-label={ariaLabel}
        className={cn(
          // Full-width on mobile, fixed 320px on desktop
          'w-full sm:w-80',
          className
        )}
      >
        <div className="relative flex items-center">
          {/* Search icon – left */}
          <span
            className="pointer-events-none absolute left-3 flex items-center text-secondary-400"
            aria-hidden="true"
          >
            <SearchIcon />
          </span>

          {/* Input */}
          <input
            ref={ref}
            type="search"
            role="searchbox"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={cn(
              // Base
              'w-full rounded-xl border border-secondary-300 bg-white',
              'text-sm text-secondary-900 placeholder:text-secondary-400',
              // Padding: left for search icon, right for clear button
              'py-2.5 pl-10',
              hasValue ? 'pr-10' : 'pr-4',
              // Focus ring
              'outline-none',
              'focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:ring-offset-0',
              // Transition
              'transition-colors duration-200 ease-in-out',
              // Disabled
              disabled && 'cursor-not-allowed border-secondary-200 bg-cream-100 text-secondary-400',
              // Remove browser default search cancel button (webkit)
              '[&::-webkit-search-cancel-button]:appearance-none',
              '[&::-webkit-search-decoration]:appearance-none'
            )}
          />

          {/* Clear button – only visible when input has a value */}
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              aria-label="Clear search"
              className={cn(
                'absolute right-3 flex items-center justify-center',
                'h-5 w-5 rounded-full',
                'text-secondary-400 hover:text-secondary-600',
                'hover:bg-secondary-100',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-primary-400 focus-visible:ring-offset-1',
                disabled && 'pointer-events-none opacity-50'
              )}
              data-testid="search-clear-button"
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
