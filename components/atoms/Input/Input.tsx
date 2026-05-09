import React, { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Input type */
  type?: InputType;
  /** Label text rendered above the input */
  label?: string;
  /** Helper text rendered below the input */
  helperText?: string;
  /** Error message – also sets the error state */
  errorMessage?: string;
  /** Explicit validation state (error/success override errorMessage) */
  state?: InputState;
  /** Icon rendered on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Icon rendered on the right side of the input (hidden when type="password") */
  rightIcon?: React.ReactNode;
  /** Show a required indicator (*) next to the label */
  required?: boolean;
  /** Stretch to fill the parent container */
  fullWidth?: boolean;
  /** Additional class names for the outer wrapper */
  wrapperClassName?: string;
}

// ─── Eye icons ────────────────────────────────────────────────────────────────

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
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
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ─── Border styles per state ──────────────────────────────────────────────────

const stateStyles: Record<InputState, string> = {
  default: ['border-secondary-300', 'focus:border-primary-400 focus:ring-primary-400'].join(' '),
  error: ['border-red-400', 'focus:border-red-500 focus:ring-red-400'].join(' '),
  success: [
    'border-accent-mint-400',
    'focus:border-accent-mint-500 focus:ring-accent-mint-400',
  ].join(' '),
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Input atom component.
 *
 * Supports text, email, password, number, tel, and search types with
 * label, helper text, error/success validation states, left/right icon
 * slots, and a password show/hide toggle.
 *
 * Fully accessible: associates label via htmlFor/id, uses aria-describedby
 * for helper/error text, aria-invalid for error state, and aria-required
 * for required fields.
 *
 * Implements Requirements 18.5 (form inputs have associated labels and
 * ARIA attributes).
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      helperText,
      errorMessage,
      state: stateProp,
      leftIcon,
      rightIcon,
      required = false,
      disabled = false,
      fullWidth = false,
      wrapperClassName,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    // Auto-generate a stable id when none is provided
    const generatedId = useId();
    const id = idProp ?? generatedId;

    // Password visibility toggle
    const [showPassword, setShowPassword] = useState(false);

    // Derive effective state: explicit prop > errorMessage presence > default
    const effectiveState: InputState = stateProp ?? (errorMessage ? 'error' : 'default');

    // Resolved input type (password toggle)
    const resolvedType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // IDs for aria-describedby
    const helperId = helperText ? `${id}-helper` : undefined;
    const errorId = errorMessage ? `${id}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    // Padding adjustments for icons
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon) || type === 'password';

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label htmlFor={id} className="select-none text-sm font-medium text-secondary-800">
            {label}
            {required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                {' '}
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {hasLeftIcon && (
            <span
              className="pointer-events-none absolute left-3 flex items-center text-secondary-400"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={effectiveState === 'error'}
            aria-describedby={describedBy}
            className={cn(
              // Base
              'w-full rounded-xl border bg-white text-sm text-secondary-900',
              'placeholder:text-secondary-400',
              // Padding
              'px-4 py-2.5',
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              // Focus ring
              'outline-none ring-0',
              'focus:ring-2 focus:ring-offset-0',
              // Transition
              'transition-colors duration-200 ease-in-out',
              // Disabled
              disabled && 'cursor-not-allowed border-secondary-200 bg-cream-100 text-secondary-400',
              // State-based border/ring
              !disabled && stateStyles[effectiveState],
              className
            )}
            {...rest}
          />

          {/* Right icon or password toggle */}
          {type === 'password' ? (
            <button
              type="button"
              tabIndex={0}
              onClick={() => setShowPassword((v) => !v)}
              className={cn(
                'absolute right-3 flex items-center text-secondary-400',
                'hover:text-secondary-600 focus-visible:outline-none',
                'rounded focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
                disabled && 'pointer-events-none opacity-50'
              )}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={disabled}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : (
            hasRightIcon && (
              <span
                className="pointer-events-none absolute right-3 flex items-center text-secondary-400"
                aria-hidden="true"
              >
                {rightIcon}
              </span>
            )
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p id={helperId} className="text-xs text-secondary-500">
            {helperText}
          </p>
        )}

        {/* Error message */}
        {errorMessage && (
          <p id={errorId} role="alert" className="text-xs text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
