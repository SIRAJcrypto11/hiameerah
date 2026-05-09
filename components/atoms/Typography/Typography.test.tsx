import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Text } from './Typography';

// ─── Heading ──────────────────────────────────────────────────────────────────

describe('Heading – rendering', () => {
  it('renders children', () => {
    render(<Heading>Hello</Heading>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('defaults to h2 element', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders as h1 when as="h1"', () => {
    render(<Heading as="h1">Main Title</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders all heading levels', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    levels.forEach((level) => {
      const { unmount } = render(<Heading as={`h${level}` as any}>H{level}</Heading>);
      expect(screen.getByRole('heading', { level })).toBeInTheDocument();
      unmount();
    });
  });

  it('applies display font class when display=true', () => {
    render(<Heading display>Display</Heading>);
    expect(screen.getByRole('heading').className).toMatch(/font-display/);
  });

  it('applies sans font class by default', () => {
    render(<Heading>Sans</Heading>);
    expect(screen.getByRole('heading').className).toMatch(/font-sans/);
  });

  it('applies custom size class', () => {
    render(<Heading size="4xl">Big</Heading>);
    expect(screen.getByRole('heading').className).toMatch(/text-5xl/);
  });

  it('accepts additional className', () => {
    render(<Heading className="text-primary-500">Colored</Heading>);
    expect(screen.getByRole('heading').className).toMatch(/text-primary-500/);
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Ref</Heading>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

// ─── Text ─────────────────────────────────────────────────────────────────────

describe('Text – rendering', () => {
  it('renders children', () => {
    render(<Text>Body text</Text>);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('defaults to p element', () => {
    render(<Text>Paragraph</Text>);
    expect(screen.getByText('Paragraph').tagName).toBe('P');
  });

  it('renders as span when as="span"', () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText('Inline').tagName).toBe('SPAN');
  });

  it('renders as div when as="div"', () => {
    render(<Text as="div">Block</Text>);
    expect(screen.getByText('Block').tagName).toBe('DIV');
  });
});

describe('Text – sizes', () => {
  const sizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;
  const sizeClasses: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  sizes.forEach((size) => {
    it(`applies ${size} size class`, () => {
      render(<Text size={size}>{size}</Text>);
      expect(screen.getByText(size).className).toMatch(new RegExp(sizeClasses[size]));
    });
  });
});

describe('Text – colors', () => {
  it('applies default color class', () => {
    render(<Text>Default</Text>);
    expect(screen.getByText('Default').className).toMatch(/text-secondary-900/);
  });

  it('applies muted color class', () => {
    render(<Text color="muted">Muted</Text>);
    expect(screen.getByText('Muted').className).toMatch(/text-secondary-600/);
  });

  it('applies primary color class', () => {
    render(<Text color="primary">Primary</Text>);
    expect(screen.getByText('Primary').className).toMatch(/text-primary-500/);
  });

  it('applies error color class', () => {
    render(<Text color="error">Error</Text>);
    expect(screen.getByText('Error').className).toMatch(/text-red-500/);
  });
});

describe('Text – truncate', () => {
  it('applies truncate class when truncate=true', () => {
    render(<Text truncate>Long text</Text>);
    expect(screen.getByText('Long text').className).toMatch(/truncate/);
  });

  it('does not apply truncate class by default', () => {
    render(<Text>Normal text</Text>);
    expect(screen.getByText('Normal text').className).not.toMatch(/\btruncate\b/);
  });
});
