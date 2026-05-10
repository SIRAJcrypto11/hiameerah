import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from './CartItem';
import type { CartItemProps } from './CartItem';

// ─── Mock next/image (via Image atom) ────────────────────────────────────────
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

const baseProps: CartItemProps = {
  id: 'cart-1',
  productId: 'prod-1',
  name: 'Hijab Satin Lembut',
  imageUrl: '/images/hijab.jpg',
  size: 'M',
  color: 'Dusty Rose',
  quantity: 2,
  price: 150000,
  onQuantityChange: vi.fn(),
  onRemove: vi.fn(),
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('CartItem – rendering', () => {
  it('renders the cart item wrapper', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item')).toBeInTheDocument();
  });

  it('renders the product name', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-name')).toHaveTextContent('Hijab Satin Lembut');
  });

  it('renders size and color variant info', () => {
    render(<CartItem {...baseProps} />);
    const variant = screen.getByTestId('cart-item-variant');
    expect(variant.textContent).toContain('M');
    expect(variant.textContent).toContain('Dusty Rose');
  });

  it('renders the product image with correct alt text', () => {
    render(<CartItem {...baseProps} />);
    // The Image atom renders a wrapper div; find the img inside
    const wrapper = screen.getByTestId('cart-item-image-wrapper');
    const img = wrapper.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Hijab Satin Lembut');
  });

  it('renders the current quantity', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-quantity')).toHaveTextContent('2');
  });

  it('renders the subtotal (price × quantity)', () => {
    render(<CartItem {...baseProps} />);
    // 150000 × 2 = 300000 → Rp 300.000
    const subtotal = screen.getByTestId('cart-item-subtotal');
    expect(subtotal.textContent).toMatch(/Rp/);
    expect(subtotal.textContent).toMatch(/300/);
  });

  it('renders unit price when quantity > 1', () => {
    render(<CartItem {...baseProps} />);
    const unitPrice = screen.getByTestId('cart-item-unit-price');
    expect(unitPrice.textContent).toMatch(/150/);
  });

  it('does not render unit price when quantity is 1', () => {
    render(<CartItem {...baseProps} quantity={1} />);
    expect(screen.queryByTestId('cart-item-unit-price')).not.toBeInTheDocument();
  });

  it('renders the remove button', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-remove')).toBeInTheDocument();
  });

  it('renders decrement and increment buttons', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-decrement')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-increment')).toBeInTheDocument();
  });
});

// ─── Subtotal calculation (Req 10.5, 10.8) ───────────────────────────────────

describe('CartItem – subtotal calculation', () => {
  it('calculates subtotal as price × quantity', () => {
    render(<CartItem {...baseProps} price={75000} quantity={3} />);
    // 75000 × 3 = 225000
    const subtotal = screen.getByTestId('cart-item-subtotal');
    expect(subtotal.textContent).toMatch(/225/);
  });

  it('shows correct subtotal for quantity of 1', () => {
    render(<CartItem {...baseProps} price={150000} quantity={1} />);
    const subtotal = screen.getByTestId('cart-item-subtotal');
    expect(subtotal.textContent).toMatch(/150/);
  });

  it('formats subtotal with Rp prefix', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-subtotal').textContent).toMatch(/Rp/);
  });
});

// ─── Quantity controls (Req 10.7) ─────────────────────────────────────────────

describe('CartItem – quantity controls', () => {
  it('calls onQuantityChange with incremented value on increment click', () => {
    const onQuantityChange = vi.fn();
    render(<CartItem {...baseProps} quantity={2} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByTestId('cart-item-increment'));
    expect(onQuantityChange).toHaveBeenCalledOnce();
    expect(onQuantityChange).toHaveBeenCalledWith('cart-1', 3);
  });

  it('calls onQuantityChange with decremented value on decrement click', () => {
    const onQuantityChange = vi.fn();
    render(<CartItem {...baseProps} quantity={3} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByTestId('cart-item-decrement'));
    expect(onQuantityChange).toHaveBeenCalledOnce();
    expect(onQuantityChange).toHaveBeenCalledWith('cart-1', 2);
  });

  it('decrement button is disabled when quantity is 1', () => {
    render(<CartItem {...baseProps} quantity={1} />);
    expect(screen.getByTestId('cart-item-decrement')).toBeDisabled();
  });

  it('decrement button is enabled when quantity is greater than 1', () => {
    render(<CartItem {...baseProps} quantity={2} />);
    expect(screen.getByTestId('cart-item-decrement')).not.toBeDisabled();
  });

  it('does not call onQuantityChange when decrement is clicked at quantity 1', () => {
    const onQuantityChange = vi.fn();
    render(<CartItem {...baseProps} quantity={1} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByTestId('cart-item-decrement'));
    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  it('increment button is always enabled', () => {
    render(<CartItem {...baseProps} quantity={1} />);
    expect(screen.getByTestId('cart-item-increment')).not.toBeDisabled();
  });
});

// ─── Remove button (Req 10.8) ─────────────────────────────────────────────────

describe('CartItem – remove button', () => {
  it('calls onRemove with cart item id when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<CartItem {...baseProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByTestId('cart-item-remove'));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledWith('cart-1');
  });
});

// ─── Accessibility (Req 18.3) ─────────────────────────────────────────────────

describe('CartItem – accessibility', () => {
  it('remove button has descriptive aria-label', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-remove')).toHaveAttribute(
      'aria-label',
      'Remove Hijab Satin Lembut from cart'
    );
  });

  it('decrement button has descriptive aria-label', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-decrement')).toHaveAttribute(
      'aria-label',
      'Decrease quantity of Hijab Satin Lembut'
    );
  });

  it('increment button has descriptive aria-label', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-increment')).toHaveAttribute(
      'aria-label',
      'Increase quantity of Hijab Satin Lembut'
    );
  });

  it('quantity display has aria-live="polite" for screen reader updates', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-quantity')).toHaveAttribute('aria-live', 'polite');
  });

  it('quantity group has aria-label', () => {
    render(<CartItem {...baseProps} />);
    const group = screen.getByRole('group', { name: /Quantity for Hijab Satin Lembut/i });
    expect(group).toBeInTheDocument();
  });

  it('all interactive buttons have type="button"', () => {
    render(<CartItem {...baseProps} />);
    expect(screen.getByTestId('cart-item-remove')).toHaveAttribute('type', 'button');
    expect(screen.getByTestId('cart-item-decrement')).toHaveAttribute('type', 'button');
    expect(screen.getByTestId('cart-item-increment')).toHaveAttribute('type', 'button');
  });
});

// ─── Custom className ─────────────────────────────────────────────────────────

describe('CartItem – className prop', () => {
  it('applies custom className to the wrapper', () => {
    render(<CartItem {...baseProps} className="custom-class" />);
    expect(screen.getByTestId('cart-item')).toHaveClass('custom-class');
  });
});
