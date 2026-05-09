import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProductCard from './ProductCard';
import type { ProductCardProduct } from './ProductCard';

// ─── Mock next/image ──────────────────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
    className,
    'data-testid': testId,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
    className?: string;
    'data-testid'?: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} className={className} data-testid={testId} {...rest} />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseProduct: ProductCardProduct = {
  id: 'prod-1',
  name: 'Hijab Satin Lembut',
  price: 150000,
  images: ['/images/hijab-primary.jpg', '/images/hijab-secondary.jpg'],
  category: 'Hijab',
  inStock: true,
  isNew: false,
};

const outOfStockProduct: ProductCardProduct = {
  ...baseProduct,
  id: 'prod-2',
  inStock: false,
};

const newProduct: ProductCardProduct = {
  ...baseProduct,
  id: 'prod-3',
  isNew: true,
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('ProductCard – rendering', () => {
  it('renders the product card article element', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });

  it('renders the product name', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId('product-name')).toHaveTextContent('Hijab Satin Lembut');
  });

  it('renders the price formatted in IDR (Rp format)', () => {
    render(<ProductCard product={baseProduct} />);
    const priceEl = screen.getByTestId('product-price');
    // IDR format: Rp 150.000 or Rp150.000 depending on locale
    expect(priceEl.textContent).toMatch(/Rp/);
    expect(priceEl.textContent).toMatch(/150/);
  });

  it('renders the primary image with correct alt text', () => {
    render(<ProductCard product={baseProduct} />);
    const primary = screen.getByTestId('product-image-primary');
    expect(primary).toHaveAttribute('src', '/images/hijab-primary.jpg');
    expect(primary).toHaveAttribute('alt', 'Hijab Satin Lembut');
  });

  it('renders the secondary image for preloading', () => {
    render(<ProductCard product={baseProduct} />);
    const secondary = screen.getByTestId('product-image-secondary');
    expect(secondary).toHaveAttribute('src', '/images/hijab-secondary.jpg');
  });

  it('renders the wishlist button', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId('wishlist-button')).toBeInTheDocument();
  });

  it('renders the quick view overlay', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId('quick-view-overlay')).toBeInTheDocument();
  });
});

// ─── Image hover effect (Req 3.1, 3.2, 3.3) ──────────────────────────────────

describe('ProductCard – image hover effect', () => {
  it('primary image is visible and secondary is hidden by default', () => {
    render(<ProductCard product={baseProduct} />);
    const primary = screen.getByTestId('product-image-primary');
    const secondary = screen.getByTestId('product-image-secondary');
    expect(primary.className).toMatch(/opacity-100/);
    expect(secondary.className).toMatch(/opacity-0/);
  });

  it('swaps to secondary image on mouse enter', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    const primary = screen.getByTestId('product-image-primary');
    const secondary = screen.getByTestId('product-image-secondary');
    expect(primary.className).toMatch(/opacity-0/);
    expect(secondary.className).toMatch(/opacity-100/);
  });

  it('restores primary image on mouse leave', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    const primary = screen.getByTestId('product-image-primary');
    const secondary = screen.getByTestId('product-image-secondary');
    expect(primary.className).toMatch(/opacity-100/);
    expect(secondary.className).toMatch(/opacity-0/);
  });

  it('applies transition-opacity class for smooth fade (Req 3.3)', () => {
    render(<ProductCard product={baseProduct} />);
    const primary = screen.getByTestId('product-image-primary');
    expect(primary.className).toMatch(/transition-opacity/);
  });

  it('secondary image is always rendered (preloaded) – Req 3.5', () => {
    render(<ProductCard product={baseProduct} />);
    // Secondary image is in the DOM even before hover
    expect(screen.getByTestId('product-image-secondary')).toBeInTheDocument();
  });
});

// ─── Quick View overlay (Req 3.6) ─────────────────────────────────────────────

describe('ProductCard – Quick View overlay', () => {
  it('quick view overlay is hidden by default (not hovered)', () => {
    render(<ProductCard product={baseProduct} />);
    const overlay = screen.getByTestId('quick-view-overlay');
    expect(overlay.className).toMatch(/opacity-0/);
  });

  it('quick view overlay becomes visible on hover', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    const overlay = screen.getByTestId('quick-view-overlay');
    expect(overlay.className).toMatch(/opacity-100/);
  });

  it('quick view overlay hides again on mouse leave', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    const overlay = screen.getByTestId('quick-view-overlay');
    expect(overlay.className).toMatch(/opacity-0/);
  });

  it('calls onQuickView with product id when Quick View button is clicked', () => {
    const onQuickView = vi.fn();
    render(<ProductCard product={baseProduct} onQuickView={onQuickView} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    const button = screen.getByTestId('quick-view-button');
    fireEvent.click(button);
    expect(onQuickView).toHaveBeenCalledOnce();
    expect(onQuickView).toHaveBeenCalledWith('prod-1');
  });

  it('does not throw when onQuickView is not provided', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.mouseEnter(card);
    const button = screen.getByTestId('quick-view-button');
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});

// ─── Wishlist toggle (Req 11.3) ───────────────────────────────────────────────

describe('ProductCard – wishlist toggle', () => {
  it('renders heart icon in outline state by default', () => {
    render(<ProductCard product={baseProduct} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders heart icon in filled state when isWishlisted=true', () => {
    render(<ProductCard product={baseProduct} isWishlisted={true} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles wishlist state on click', () => {
    render(<ProductCard product={baseProduct} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onAddToWishlist with product id when toggled', () => {
    const onAddToWishlist = vi.fn();
    render(<ProductCard product={baseProduct} onAddToWishlist={onAddToWishlist} />);
    const btn = screen.getByTestId('wishlist-button');
    fireEvent.click(btn);
    expect(onAddToWishlist).toHaveBeenCalledOnce();
    expect(onAddToWishlist).toHaveBeenCalledWith('prod-1');
  });

  it('has accessible aria-label for adding to wishlist', () => {
    render(<ProductCard product={baseProduct} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn).toHaveAttribute('aria-label', 'Add Hijab Satin Lembut to wishlist');
  });

  it('has accessible aria-label for removing from wishlist when wishlisted', () => {
    render(<ProductCard product={baseProduct} isWishlisted={true} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn).toHaveAttribute('aria-label', 'Remove Hijab Satin Lembut from wishlist');
  });
});

// ─── Badges (Req 2.7) ─────────────────────────────────────────────────────────

describe('ProductCard – badges', () => {
  it('does not show Out of Stock badge when product is in stock', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByTestId('badge-out-of-stock')).not.toBeInTheDocument();
  });

  it('shows Out of Stock badge when product is out of stock', () => {
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByTestId('badge-out-of-stock')).toBeInTheDocument();
    expect(screen.getByTestId('badge-out-of-stock')).toHaveTextContent('Out of Stock');
  });

  it('does not show New badge when isNew is false', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByTestId('badge-new')).not.toBeInTheDocument();
  });

  it('shows New badge when isNew is true and product is in stock', () => {
    render(<ProductCard product={newProduct} />);
    expect(screen.getByTestId('badge-new')).toBeInTheDocument();
    expect(screen.getByTestId('badge-new')).toHaveTextContent('New');
  });

  it('does not show New badge when product is out of stock (out-of-stock takes priority)', () => {
    const outOfStockNew: ProductCardProduct = { ...newProduct, inStock: false };
    render(<ProductCard product={outOfStockNew} />);
    expect(screen.getByTestId('badge-out-of-stock')).toBeInTheDocument();
    expect(screen.queryByTestId('badge-new')).not.toBeInTheDocument();
  });
});

// ─── Touch support (Req 3.7) ──────────────────────────────────────────────────

describe('ProductCard – touch support', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('shows secondary image after 500ms tap-and-hold', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.touchStart(card);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const secondary = screen.getByTestId('product-image-secondary');
    expect(secondary.className).toMatch(/opacity-100/);
  });

  it('does not show secondary image before 500ms', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.touchStart(card);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    const secondary = screen.getByTestId('product-image-secondary');
    expect(secondary.className).toMatch(/opacity-0/);
  });

  it('restores primary image on touch end', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.touchStart(card);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.touchEnd(card);
    const secondary = screen.getByTestId('product-image-secondary');
    expect(secondary.className).toMatch(/opacity-0/);
  });

  it('cancels timer on touch cancel', () => {
    render(<ProductCard product={baseProduct} />);
    const card = screen.getByTestId('product-card');
    fireEvent.touchStart(card);
    fireEvent.touchCancel(card);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const secondary = screen.getByTestId('product-image-secondary');
    expect(secondary.className).toMatch(/opacity-0/);
  });

  it('restores fake timers after each test', () => {
    vi.useRealTimers();
  });
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('ProductCard – accessibility', () => {
  it('uses article element for semantic HTML', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByTestId('product-card').tagName).toBe('ARTICLE');
  });

  it('wishlist button is keyboard accessible (type=button)', () => {
    render(<ProductCard product={baseProduct} />);
    const btn = screen.getByTestId('wishlist-button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });
});

// ─── Price formatting ─────────────────────────────────────────────────────────

describe('ProductCard – price formatting', () => {
  it('formats price with Rp prefix', () => {
    render(<ProductCard product={{ ...baseProduct, price: 250000 }} />);
    expect(screen.getByTestId('product-price').textContent).toMatch(/Rp/);
  });

  it('formats zero price correctly', () => {
    render(<ProductCard product={{ ...baseProduct, price: 0 }} />);
    expect(screen.getByTestId('product-price').textContent).toMatch(/Rp/);
  });
});

// ─── Custom className ─────────────────────────────────────────────────────────

describe('ProductCard – className prop', () => {
  it('applies custom className to the card wrapper', () => {
    render(<ProductCard product={baseProduct} className="custom-card" />);
    expect(screen.getByTestId('product-card')).toHaveClass('custom-card');
  });
});
