import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Shows a spinner and disables interaction */
  loading?: boolean;
  /** Icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Stretch to fill the parent container */
  fullWidth?: boolean;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  /**
   * Primary – brand pink/rose fill.
   * Hover: slightly darker shade (200ms transition).
   */
  primary: [
    'bg-primary-400 text-white',
    'hover:bg-primary-500',
    'focus-visible:ring-primary-400',
    'disabled:bg-primary-200 disabled:text-primary-50',
    'aria-disabled:bg-primary-200 aria-disabled:text-primary-50',
  ].join(' '),

  /**
   * Secondary – cream/neutral fill.
   */
  secondary: [
    'bg-cream-200 text-secondary-800',
    'hover:bg-cream-300',
    'focus-visible:ring-cream-400',
    'disabled:bg-cream-100 disabled:text-secondary-400',
    'aria-disabled:bg-cream-100 aria-disabled:text-secondary-400',
  ].join(' '),

  /**
   * Outline – transparent with a primary-coloured border.
   */
  outline: [
    'bg-transparent border border-primary-400 text-primary-500',
    'hover:bg-primary-50',
    'focus-visible:ring-primary-400',
    'disabled:border-primary-200 disabled:text-primary-200',
    'aria-disabled:border-primary-200 aria-disabled:text-primary-200',
  ].join(' '),

  /**
   * Ghost – no background or border; text only.
   */
  ghost: [
    'bg-transparent text-primary-500',
    'hover:bg-primary-50',
    'focus-visible:ring-primary-400',
    'disabled:text-primary-200',
    'aria-disabled:text-primary-200',
  ].join(' '),
};

// ─── Size styles ──────────────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Button atom component.
 *
 * Supports four visual variants (primary, secondary, outline, ghost),
 * three sizes (sm, md, lg), loading and disabled states, and the brand
 * micro-interactions defined in Requirements 29.1 and 29.2:
 *   - Hover: smooth colour transition within 200 ms
 *   - Click: subtle scale animation (0.98×) for tactile feedback
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        onClick={handleClick}
        className={cn(
          // Base layout
          'inline-flex items-center justify-center font-medium',
          // Rounded corners per brand aesthetic (8–16 px)
          'rounded-xl',
          // Smooth colour transition – Requirement 29.1 (200 ms)
          'transition-colors duration-200 ease-in-out',
          // Click scale animation – Requirement 29.2 (0.98×)
          'active:scale-[0.98]',
          // Focus ring for keyboard accessibility
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Cursor
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          // Full-width option
          fullWidth && 'w-full',
          // Variant-specific styles
          variantStyles[variant],
          // Size-specific styles
          sizeStyles[size],
          className
        )}
        {...rest}
      >
        {/* Loading spinner replaces left icon */}
        {loading ? (
          <Spinner
            className={cn(size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {/* Label */}
        {children && <span className={cn(loading && 'opacity-70')}>{children}</span>}

        {/* Right icon – hidden while loading */}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
