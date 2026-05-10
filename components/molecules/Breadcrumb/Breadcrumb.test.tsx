import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumb from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

// ─── Mock next/link ───────────────────────────────────────────────────────────
// Next.js Link renders an <a> tag; mock it to keep tests simple.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    title,
    'data-testid': testId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    title?: string;
    'data-testid'?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} title={title} data-testid={testId} {...rest}>
      {children}
    </a>
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const singleItem: BreadcrumbItem[] = [{ label: 'Home' }];

const twoItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, { label: 'Hijab' }];

const threeItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Hijab', href: '/hijab' },
  { label: 'Hijab Satin Lembut' },
];

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Breadcrumb – rendering', () => {
  it('renders the nav element with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders an ordered list', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.getByTestId('breadcrumb-list').tagName).toBe('OL');
  });

  it('renders the correct number of list items', () => {
    render(<Breadcrumb items={threeItems} />);
    // 3 items → 3 <li> elements
    expect(screen.getByTestId('breadcrumb-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-item-2')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className to the nav wrapper', () => {
    render(<Breadcrumb items={twoItems} className="my-custom-class" />);
    expect(screen.getByTestId('breadcrumb')).toHaveClass('my-custom-class');
  });
});

// ─── Links (Req 13.6 – clickable navigation) ─────────────────────────────────

describe('Breadcrumb – links', () => {
  it('renders ancestor items as links with correct href', () => {
    render(<Breadcrumb items={threeItems} />);
    const homeLink = screen.getByTestId('breadcrumb-link-0');
    expect(homeLink.tagName).toBe('A');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders intermediate ancestor items as links', () => {
    render(<Breadcrumb items={threeItems} />);
    const hijabLink = screen.getByTestId('breadcrumb-link-1');
    expect(hijabLink.tagName).toBe('A');
    expect(hijabLink).toHaveAttribute('href', '/hijab');
  });

  it('renders the last item as plain text (no link)', () => {
    render(<Breadcrumb items={threeItems} />);
    // Last item should be a <span>, not an <a>
    const lastLabel = screen.getByTestId('breadcrumb-label-2');
    expect(lastLabel.tagName).toBe('SPAN');
    expect(lastLabel).toHaveTextContent('Hijab Satin Lembut');
  });

  it('renders a single item as plain text (no link)', () => {
    render(<Breadcrumb items={singleItem} />);
    const label = screen.getByTestId('breadcrumb-label-0');
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveTextContent('Home');
  });

  it('renders item without href as plain text even if not last', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home' }, // no href
      { label: 'Hijab' },
    ];
    render(<Breadcrumb items={items} />);
    // First item has no href → rendered as span
    const firstLabel = screen.getByTestId('breadcrumb-label-0');
    expect(firstLabel.tagName).toBe('SPAN');
  });

  it('link labels match the provided item labels', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.getByTestId('breadcrumb-link-0')).toHaveTextContent('Home');
  });
});

// ─── Accessibility (Req 13.6, 18.x) ──────────────────────────────────────────

describe('Breadcrumb – accessibility', () => {
  it('marks the last item with aria-current="page"', () => {
    render(<Breadcrumb items={threeItems} />);
    const currentPage = screen.getByTestId('breadcrumb-label-2');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on ancestor items', () => {
    render(<Breadcrumb items={threeItems} />);
    const homeLink = screen.getByTestId('breadcrumb-link-0');
    expect(homeLink).not.toHaveAttribute('aria-current');
  });

  it('does not set aria-current on the only item when it has no href', () => {
    // Single item without href is still the "current page"
    render(<Breadcrumb items={singleItem} />);
    const label = screen.getByTestId('breadcrumb-label-0');
    expect(label).toHaveAttribute('aria-current', 'page');
  });

  it('nav has accessible name via aria-label', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});

// ─── Separators ───────────────────────────────────────────────────────────────

describe('Breadcrumb – separators', () => {
  it('does not render a separator before the first item', () => {
    render(<Breadcrumb items={threeItems} />);
    expect(screen.queryByTestId('breadcrumb-separator-0')).not.toBeInTheDocument();
  });

  it('renders separators between items', () => {
    render(<Breadcrumb items={threeItems} />);
    // Separators appear at index 1 and 2 (before 2nd and 3rd items)
    expect(screen.getByTestId('breadcrumb-separator-1')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-separator-2')).toBeInTheDocument();
  });

  it('renders exactly (n-1) separators for n items', () => {
    render(<Breadcrumb items={threeItems} />);
    // 3 items → 2 separators (at index 1 and 2), none at index 0
    expect(screen.queryByTestId('breadcrumb-separator-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-separator-1')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-separator-2')).toBeInTheDocument();
  });
});

// ─── Label truncation ─────────────────────────────────────────────────────────

describe('Breadcrumb – label truncation', () => {
  it('sets title attribute on link items for tooltip on truncation', () => {
    render(<Breadcrumb items={threeItems} />);
    expect(screen.getByTestId('breadcrumb-link-0')).toHaveAttribute('title', 'Home');
  });

  it('sets title attribute on plain-text items for tooltip on truncation', () => {
    render(<Breadcrumb items={threeItems} />);
    expect(screen.getByTestId('breadcrumb-label-2')).toHaveAttribute('title', 'Hijab Satin Lembut');
  });
});

// ─── Two-item breadcrumb (common case) ───────────────────────────────────────

describe('Breadcrumb – two-item trail', () => {
  it('renders home link and current page label', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.getByTestId('breadcrumb-link-0')).toHaveTextContent('Home');
    expect(screen.getByTestId('breadcrumb-label-1')).toHaveTextContent('Hijab');
  });

  it('renders exactly one separator', () => {
    render(<Breadcrumb items={twoItems} />);
    expect(screen.queryByTestId('breadcrumb-separator-0')).not.toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-separator-1')).toBeInTheDocument();
  });
});
