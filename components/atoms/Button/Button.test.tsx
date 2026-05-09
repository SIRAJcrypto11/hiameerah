import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Button – rendering', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('defaults to type="button" to avoid accidental form submission', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('accepts a custom type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('renders a left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>Label</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders a right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon" />}>Label</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});

// ─── Variants ─────────────────────────────────────────────────────────────────

describe('Button – variants', () => {
  const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;

  variants.forEach((variant) => {
    it(`renders without error for variant="${variant}"`, () => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('applies primary styles by default', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    // Primary uses bg-primary-400
    expect(btn.className).toMatch(/bg-primary-400/);
  });

  it('applies outline border class for outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button').className).toMatch(/border/);
  });
});

// ─── Sizes ────────────────────────────────────────────────────────────────────

describe('Button – sizes', () => {
  it('applies sm size class', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toMatch(/h-8/);
  });

  it('applies md size class (default)', () => {
    render(<Button>Medium</Button>);
    expect(screen.getByRole('button').className).toMatch(/h-10/);
  });

  it('applies lg size class', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toMatch(/h-12/);
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('Button – disabled state', () => {
  it('sets disabled attribute when disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets aria-disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not fire onClick when disabled', () => {
    const handler = vi.fn();
    render(
      <Button disabled onClick={handler}>
        Disabled
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies cursor-not-allowed class when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button').className).toMatch(/cursor-not-allowed/);
  });
});

// ─── Loading state ────────────────────────────────────────────────────────────

describe('Button – loading state', () => {
  it('sets aria-busy when loading=true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('sets aria-disabled when loading=true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders a spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    // The SVG spinner has animate-spin class
    const spinner = screen.getByRole('button').querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.className).toMatch(/animate-spin/);
  });

  it('hides the right icon while loading', () => {
    render(
      <Button loading rightIcon={<span data-testid="right-icon" />}>
        Loading
      </Button>
    );
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('does not fire onClick when loading', () => {
    const handler = vi.fn();
    render(
      <Button loading onClick={handler}>
        Loading
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── Interactions ─────────────────────────────────────────────────────────────

describe('Button – interactions', () => {
  it('fires onClick when clicked and not disabled', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('applies transition-colors class for hover animation (Req 29.1)', () => {
    render(<Button>Hover</Button>);
    expect(screen.getByRole('button').className).toMatch(/transition-colors/);
  });

  it('applies duration-200 class for 200ms transition (Req 29.1)', () => {
    render(<Button>Hover</Button>);
    expect(screen.getByRole('button').className).toMatch(/duration-200/);
  });

  it('applies active:scale-[0.98] class for click animation (Req 29.2)', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button').className).toMatch(/active:scale-\[0\.98\]/);
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('Button – accessibility', () => {
  it('is focusable by default', () => {
    render(<Button>Focus</Button>);
    const btn = screen.getByRole('button');
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('has focus-visible ring classes', () => {
    render(<Button>Focus</Button>);
    expect(screen.getByRole('button').className).toMatch(/focus-visible:ring-2/);
  });

  it('forwards ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('passes through additional HTML attributes', () => {
    render(
      <Button data-testid="custom-btn" aria-label="Custom label">
        Btn
      </Button>
    );
    const btn = screen.getByTestId('custom-btn');
    expect(btn).toHaveAttribute('aria-label', 'Custom label');
  });
});

// ─── Full-width ───────────────────────────────────────────────────────────────

describe('Button – fullWidth', () => {
  it('applies w-full class when fullWidth=true', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button').className).toMatch(/w-full/);
  });

  it('does not apply w-full by default', () => {
    render(<Button>Normal</Button>);
    expect(screen.getByRole('button').className).not.toMatch(/\bw-full\b/);
  });
});
