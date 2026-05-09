import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge – rendering', () => {
  it('renders children text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test').tagName).toBe('SPAN');
  });

  it('has role="status" for accessibility', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Badge – variants', () => {
  const variants = ['new', 'out-of-stock', 'sale', 'featured', 'default'] as const;

  variants.forEach((variant) => {
    it(`renders without error for variant="${variant}"`, () => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
    });
  });

  it('applies new variant styles (mint green)', () => {
    render(<Badge variant="new">New</Badge>);
    expect(screen.getByRole('status').className).toMatch(/bg-accent-mint-100/);
  });

  it('applies out-of-stock variant styles (neutral)', () => {
    render(<Badge variant="out-of-stock">Out of Stock</Badge>);
    expect(screen.getByRole('status').className).toMatch(/bg-secondary-100/);
  });

  it('applies sale variant styles (rose)', () => {
    render(<Badge variant="sale">Sale</Badge>);
    expect(screen.getByRole('status').className).toMatch(/bg-primary-100/);
  });

  it('applies featured variant styles (lavender)', () => {
    render(<Badge variant="featured">Featured</Badge>);
    expect(screen.getByRole('status').className).toMatch(/bg-accent-lavender-100/);
  });

  it('applies default variant styles when no variant specified', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByRole('status').className).toMatch(/bg-cream-200/);
  });
});

describe('Badge – sizes', () => {
  it('applies sm size class', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByRole('status').className).toMatch(/px-1\.5/);
  });

  it('applies md size class (default)', () => {
    render(<Badge>Medium</Badge>);
    expect(screen.getByRole('status').className).toMatch(/px-2\.5/);
  });
});

describe('Badge – dot indicator', () => {
  it('renders a dot element when dot=true', () => {
    const { container } = render(<Badge dot>Active</Badge>);
    // The dot is a span with aria-hidden inside the badge
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it('does not render a dot element when dot is not set', () => {
    const { container } = render(<Badge>No Dot</Badge>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  it('dot has rounded-full class', () => {
    const { container } = render(<Badge dot>Dot Badge</Badge>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot?.className).toMatch(/rounded-full/);
  });
});

describe('Badge – styling', () => {
  it('has rounded-full class for pill shape', () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByRole('status').className).toMatch(/rounded-full/);
  });

  it('accepts additional className', () => {
    render(<Badge className="absolute left-2 top-2">Positioned</Badge>);
    expect(screen.getByRole('status').className).toMatch(/absolute/);
  });
});
