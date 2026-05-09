import React, { useState, useRef, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductCardProduct {
  id: string;
  name: string;
  price: number;
  images: string[]; // minimum 2 for hover effect
  category: string;
  inStock: boolean;
  isNew?: boolean;
}

export interface ProductCardProps {
  /** Product data to display */
  product: ProductCardProduct;
  /** Called when the Quick View button is clicked */
  onQuickView?: (productId: string) => void;
  /** Called when the wishlist heart icon is toggled */
  onAddToWishlist?: (productId: string) => void;
  /** Whether the product is currently in the wishlist */
  isWishlisted?: boolean;
  /** Additional class names for the card wrapper */
  className?: string;
}

// ─── Heart icon ───────────────────────────────────────────────────────────────

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductCard molecule component.
 *
 * Displays a product preview card with:
 * - Primary image that swaps to secondary on hover (200ms transition) – Req 3.1, 3.2, 3.3
 * - Quick View button overlay on hover – Req 3.6
 * - Wishlist heart icon toggle (outline → filled) – Req 11.3
 * - "Out of Stock" badge when !inStock – Req 2.7
 * - "New" badge when isNew – Req 2.7
 * - Preloaded secondary image for smooth transitions – Req 3.5
 * - Touch device support: tap-and-hold 500ms shows secondary image – Req 3.7
 * - Price formatted in IDR (Rp format) – Req 2.6
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToWishlist,
  isWishlisted = false,
  className,
}) => {
  const { id, name, price, images, inStock, isNew } = product;

  // ── State ──────────────────────────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [touchActive, setTouchActive] = useState(false);

  // Sync external isWishlisted prop
  useEffect(() => {
    setWishlisted(isWishlisted);
  }, [isWishlisted]);

  // ── Touch support ──────────────────────────────────────────────────────────
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    touchTimerRef.current = setTimeout(() => {
      setTouchActive(true);
    }, 500); // 500ms tap-and-hold – Req 3.7
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setTouchActive(false);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────
  const showSecondary = isHovered || touchActive;
  const primaryImage = images[0] ?? '';
  const secondaryImage = images[1] ?? images[0] ?? '';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !wishlisted;
      setWishlisted(next);
      onAddToWishlist?.(id);
    },
    [wishlisted, id, onAddToWishlist]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickView?.(id);
    },
    [id, onQuickView]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-white',
        'shadow-sm transition-shadow duration-200 hover:shadow-md',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      data-testid="product-card"
    >
      {/* ── Image container ─────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        {/* Primary image */}
        <NextImage
          src={primaryImage}
          alt={name}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-opacity duration-200',
            showSecondary ? 'opacity-0' : 'opacity-100'
          )}
          data-testid="product-image-primary"
        />

        {/* Secondary image – always rendered for preloading (Req 3.5) */}
        <NextImage
          src={secondaryImage}
          alt={`${name} – alternate view`}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-opacity duration-200',
            showSecondary ? 'opacity-100' : 'opacity-0'
          )}
          data-testid="product-image-secondary"
        />

        {/* ── Badges ──────────────────────────────────────────────────── */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {!inStock && (
            <span data-testid="badge-out-of-stock">
              <Badge variant="out-of-stock" size="sm">
                Out of Stock
              </Badge>
            </span>
          )}
          {isNew && inStock && (
            <span data-testid="badge-new">
              <Badge variant="new" size="sm">
                New
              </Badge>
            </span>
          )}
        </div>

        {/* ── Wishlist button ──────────────────────────────────────────── */}
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={wishlisted}
          onClick={handleWishlistToggle}
          className={cn(
            'absolute right-2 top-2 z-10',
            'flex items-center justify-center',
            'h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm',
            'shadow-sm transition-all duration-200',
            'hover:scale-110 hover:bg-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
            wishlisted ? 'text-primary-500' : 'text-secondary-400 hover:text-primary-400'
          )}
          data-testid="wishlist-button"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* ── Quick View overlay ───────────────────────────────────────── */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-10 p-3',
            'transition-all duration-200',
            isHovered ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
          )}
          data-testid="quick-view-overlay"
        >
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleQuickView}
            className="bg-white/90 text-secondary-800 backdrop-blur-sm hover:bg-white"
            data-testid="quick-view-button"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* ── Product info ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 p-3">
        <p
          className="line-clamp-2 text-sm font-medium leading-snug text-secondary-800"
          data-testid="product-name"
        >
          {name}
        </p>
        <p
          className={cn(
            'text-sm font-semibold',
            inStock ? 'text-primary-500' : 'text-secondary-400'
          )}
          data-testid="product-price"
        >
          {formatPrice(price)}
        </p>
      </div>
    </article>
  );
};

ProductCard.displayName = 'ProductCard';

export default ProductCard;
