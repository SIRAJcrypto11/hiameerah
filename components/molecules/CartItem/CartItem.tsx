import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import Image from '@/components/atoms/Image';
import Button from '@/components/atoms/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItemProps {
  /** Unique cart item identifier */
  id: string;
  /** Product identifier */
  productId: string;
  /** Product name */
  name: string;
  /** Product image URL */
  imageUrl: string;
  /** Selected size */
  size: string;
  /** Selected color */
  color: string;
  /** Current quantity (minimum 1) */
  quantity: number;
  /** Unit price in IDR */
  price: number;
  /** Called when quantity changes; receives cart item id and new quantity */
  onQuantityChange: (id: string, quantity: number) => void;
  /** Called when the remove button is clicked; receives cart item id */
  onRemove: (id: string) => void;
  /** Additional class names for the wrapper */
  className?: string;
}

// ─── Trash icon ───────────────────────────────────────────────────────────────

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CartItem molecule component.
 *
 * Displays a single item in the shopping cart with:
 * - Product image (3:4 aspect ratio, small) – Req 10.5
 * - Product name, size, and color info – Req 10.5
 * - Quantity controls (decrement / display / increment) – Req 10.7
 * - Unit price and calculated subtotal (price × quantity) – Req 10.5, 10.8
 * - Remove button – Req 10.8
 * - Accessible aria-labels on all interactive controls – Req 18.3
 */
const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  imageUrl,
  size,
  color,
  quantity,
  price,
  onQuantityChange,
  onRemove,
  className,
}) => {
  const subtotal = price * quantity;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  }, [id, quantity, onQuantityChange]);

  const handleIncrement = useCallback(() => {
    onQuantityChange(id, quantity + 1);
  }, [id, quantity, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn('flex gap-3 rounded-xl bg-white p-3', 'border border-cream-200', className)}
      data-testid="cart-item"
    >
      {/* ── Product image ──────────────────────────────────────────────── */}
      <div className="w-20 shrink-0" data-testid="cart-item-image-wrapper">
        <Image
          src={imageUrl}
          alt={name}
          aspectRatio="product"
          width={80}
          height={107}
          sizes="80px"
          className="rounded-lg"
          data-testid="cart-item-image"
        />
      </div>

      {/* ── Details ────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Top row: name + remove button */}
        <div className="flex items-start justify-between gap-2">
          <p
            className="line-clamp-2 text-sm font-medium leading-snug text-secondary-800"
            data-testid="cart-item-name"
          >
            {name}
          </p>

          {/* Remove button */}
          <button
            type="button"
            aria-label={`Remove ${name} from cart`}
            onClick={handleRemove}
            className={cn(
              'shrink-0 rounded-lg p-1',
              'text-secondary-400 transition-colors duration-200',
              'hover:bg-red-50 hover:text-red-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
            )}
            data-testid="cart-item-remove"
          >
            <TrashIcon />
          </button>
        </div>

        {/* Size and color */}
        <p className="text-xs text-secondary-500" data-testid="cart-item-variant">
          {size} · {color}
        </p>

        {/* Bottom row: quantity controls + subtotal */}
        <div className="flex items-center justify-between gap-2">
          {/* Quantity controls */}
          <div
            className="flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50"
            role="group"
            aria-label={`Quantity for ${name}`}
          >
            {/* Decrement */}
            <button
              type="button"
              aria-label={`Decrease quantity of ${name}`}
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'text-secondary-600 transition-colors duration-200',
                'hover:bg-cream-200 hover:text-secondary-800',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                'disabled:cursor-not-allowed disabled:text-secondary-300'
              )}
              data-testid="cart-item-decrement"
            >
              <span aria-hidden="true" className="text-base leading-none">
                −
              </span>
            </button>

            {/* Quantity display */}
            <span
              className="min-w-[1.5rem] text-center text-sm font-medium text-secondary-800"
              aria-live="polite"
              aria-atomic="true"
              data-testid="cart-item-quantity"
            >
              {quantity}
            </span>

            {/* Increment */}
            <button
              type="button"
              aria-label={`Increase quantity of ${name}`}
              onClick={handleIncrement}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'text-secondary-600 transition-colors duration-200',
                'hover:bg-cream-200 hover:text-secondary-800',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400'
              )}
              data-testid="cart-item-increment"
            >
              <span aria-hidden="true" className="text-base leading-none">
                +
              </span>
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-sm font-semibold text-primary-500" data-testid="cart-item-subtotal">
              {formatPrice(subtotal)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-secondary-400" data-testid="cart-item-unit-price">
                {formatPrice(price)} / pcs
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CartItem.displayName = 'CartItem';

export default CartItem;
