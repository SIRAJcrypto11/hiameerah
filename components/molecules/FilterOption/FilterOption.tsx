import React, { useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

// ─── CheckboxFilterOption ─────────────────────────────────────────────────────

export interface CheckboxFilterOptionProps {
  /** The filter option label */
  label: string;
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Called when the checkbox state changes */
  onChange: (checked: boolean) => void;
  /** Optional count of products matching this filter */
  count?: number;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * CheckboxFilterOption molecule component.
 *
 * A single filter checkbox item with:
 * - Label text
 * - Optional count badge showing number of matching products
 * - Checked/unchecked state with active (primary color) highlight
 * - Accessible: proper label/input association via htmlFor/id
 *
 * Implements Requirements 5.1, 5.2 (filter options for category, color, etc.)
 */
export const CheckboxFilterOption: React.FC<CheckboxFilterOptionProps> = ({
  label,
  checked,
  onChange,
  count,
  disabled = false,
  className,
}) => {
  const id = useId();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5',
        'transition-colors duration-150',
        // Active state: primary color highlight on the row
        checked
          ? 'bg-primary-50 text-primary-700'
          : 'text-secondary-700 hover:bg-cream-100 hover:text-secondary-900',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      data-testid="checkbox-filter-option"
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={count !== undefined ? `${label} (${count} products)` : label}
        className={cn(
          // Custom styled checkbox
          'h-4 w-4 shrink-0 appearance-none rounded',
          'border-2 transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
          checked
            ? 'border-primary-400 bg-primary-400'
            : 'border-secondary-300 bg-white group-hover:border-primary-300',
          disabled && 'cursor-not-allowed'
        )}
        data-testid="checkbox-filter-input"
      />

      {/* Checkmark icon – only visible when checked */}
      {checked && (
        <svg
          className="pointer-events-none absolute h-3 w-3 text-white"
          style={{ marginLeft: '2px' }}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Label text */}
      <span className="flex-1 select-none text-sm leading-none" data-testid="checkbox-filter-label">
        {label}
      </span>

      {/* Count badge */}
      {count !== undefined && (
        <span
          className={cn(
            'shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium leading-none',
            checked
              ? 'bg-primary-100 text-primary-600'
              : 'bg-secondary-100 text-secondary-500 group-hover:bg-secondary-200'
          )}
          data-testid="checkbox-filter-count"
          aria-label={`${count} products`}
        >
          {count}
        </span>
      )}
    </label>
  );
};

CheckboxFilterOption.displayName = 'CheckboxFilterOption';

// ─── PriceRangeSlider ─────────────────────────────────────────────────────────

export interface PriceRange {
  min: number;
  max: number;
}

export interface PriceRangeSliderProps {
  /** Current price range value */
  value: PriceRange;
  /** Called when the price range changes */
  onChange: (range: PriceRange) => void;
  /** Absolute minimum price (lower bound of the slider) */
  minBound?: number;
  /** Absolute maximum price (upper bound of the slider) */
  maxBound?: number;
  /** Step increment for the slider */
  step?: number;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * PriceRangeSlider molecule component.
 *
 * A dual-handle price range slider with:
 * - Min and max number inputs for direct value entry
 * - Two overlaid range inputs for visual slider interaction
 * - Displays current range as "Rp X – Rp Y"
 * - Calls onChange with { min, max } on every change
 * - Accessible: labeled inputs, ARIA attributes
 *
 * Implements Requirements 5.1, 5.2 (price range filter)
 */
export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  value,
  onChange,
  minBound = 0,
  maxBound = 1000000,
  step = 10000,
  className,
}) => {
  const minInputId = useId();
  const maxInputId = useId();

  const handleMinSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Number(e.target.value);
      // Ensure min doesn't exceed max
      const clampedMin = Math.min(newMin, value.max);
      onChange({ min: clampedMin, max: value.max });
    },
    [value.max, onChange]
  );

  const handleMaxSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Number(e.target.value);
      // Ensure max doesn't go below min
      const clampedMax = Math.max(newMax, value.min);
      onChange({ min: value.min, max: clampedMax });
    },
    [value.min, onChange]
  );

  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      if (!isNaN(raw)) {
        // Clamp min to [minBound, value.max] — cannot exceed current max
        const newMin = Math.max(minBound, Math.min(raw, value.max));
        onChange({ min: newMin, max: value.max });
      }
    },
    [value.max, onChange, minBound]
  );

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      if (!isNaN(raw)) {
        // Clamp max to [value.min, maxBound] — cannot go below current min
        const newMax = Math.min(maxBound, Math.max(raw, value.min));
        onChange({ min: value.min, max: newMax });
      }
    },
    [value.min, onChange, maxBound]
  );

  // Calculate percentage positions for the track fill
  const range = maxBound - minBound;
  const minPercent = range > 0 ? ((value.min - minBound) / range) * 100 : 0;
  const maxPercent = range > 0 ? ((value.max - minBound) / range) * 100 : 100;

  return (
    <div className={cn('flex flex-col gap-4', className)} data-testid="price-range-slider">
      {/* Current range display */}
      <div
        className="text-sm font-medium text-secondary-700"
        aria-live="polite"
        aria-atomic="true"
        data-testid="price-range-display"
      >
        {formatPrice(value.min)}
        <span className="mx-1 text-secondary-400">–</span>
        {formatPrice(value.max)}
      </div>

      {/* Slider track */}
      <div className="relative h-5 w-full" data-testid="price-range-track-container">
        {/* Background track */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-secondary-200" />

        {/* Active range fill */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-400"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
          data-testid="price-range-fill"
        />

        {/* Min range input */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={value.min}
          onChange={handleMinSliderChange}
          aria-label="Minimum price"
          aria-valuemin={minBound}
          aria-valuemax={maxBound}
          aria-valuenow={value.min}
          aria-valuetext={formatPrice(value.min)}
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-400',
            '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
            '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:pointer-events-auto',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-400',
            '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm',
            '[&::-moz-range-thumb]:cursor-pointer',
            'focus-visible:outline-none',
            '[&:focus-visible::-webkit-slider-thumb]:ring-2',
            '[&:focus-visible::-webkit-slider-thumb]:ring-primary-400',
            '[&:focus-visible::-webkit-slider-thumb]:ring-offset-1'
          )}
          data-testid="price-range-min-slider"
        />

        {/* Max range input */}
        <input
          type="range"
          min={minBound}
          max={maxBound}
          step={step}
          value={value.max}
          onChange={handleMaxSliderChange}
          aria-label="Maximum price"
          aria-valuemin={minBound}
          aria-valuemax={maxBound}
          aria-valuenow={value.max}
          aria-valuetext={formatPrice(value.max)}
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-400',
            '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100',
            '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:pointer-events-auto',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-400',
            '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm',
            '[&::-moz-range-thumb]:cursor-pointer',
            'focus-visible:outline-none',
            '[&:focus-visible::-webkit-slider-thumb]:ring-2',
            '[&:focus-visible::-webkit-slider-thumb]:ring-primary-400',
            '[&:focus-visible::-webkit-slider-thumb]:ring-offset-1'
          )}
          data-testid="price-range-max-slider"
        />
      </div>

      {/* Number inputs for direct value entry */}
      <div className="flex items-center gap-2">
        {/* Min price input */}
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor={minInputId}
            className="text-xs font-medium text-secondary-500"
            data-testid="price-min-label"
          >
            Min
          </label>
          <input
            id={minInputId}
            type="number"
            min={minBound}
            max={value.max}
            step={step}
            value={value.min}
            onChange={handleMinInputChange}
            aria-label="Minimum price"
            className={cn(
              'w-full rounded-lg border border-secondary-300 bg-white',
              'px-2.5 py-1.5 text-sm text-secondary-900',
              'outline-none transition-colors duration-150',
              'focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:ring-offset-0',
              '[appearance:textfield]',
              '[&::-webkit-inner-spin-button]:appearance-none',
              '[&::-webkit-outer-spin-button]:appearance-none'
            )}
            data-testid="price-min-input"
          />
        </div>

        {/* Separator */}
        <span className="mt-5 shrink-0 text-secondary-400" aria-hidden="true">
          –
        </span>

        {/* Max price input */}
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor={maxInputId}
            className="text-xs font-medium text-secondary-500"
            data-testid="price-max-label"
          >
            Max
          </label>
          <input
            id={maxInputId}
            type="number"
            min={value.min}
            max={maxBound}
            step={step}
            value={value.max}
            onChange={handleMaxInputChange}
            aria-label="Maximum price"
            className={cn(
              'w-full rounded-lg border border-secondary-300 bg-white',
              'px-2.5 py-1.5 text-sm text-secondary-900',
              'outline-none transition-colors duration-150',
              'focus:border-primary-400 focus:ring-2 focus:ring-primary-400 focus:ring-offset-0',
              '[appearance:textfield]',
              '[&::-webkit-inner-spin-button]:appearance-none',
              '[&::-webkit-outer-spin-button]:appearance-none'
            )}
            data-testid="price-max-input"
          />
        </div>
      </div>
    </div>
  );
};

PriceRangeSlider.displayName = 'PriceRangeSlider';
