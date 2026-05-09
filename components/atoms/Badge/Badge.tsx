import React from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'new' | 'out-of-stock' | 'sale' | 'featured' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Visual variant of the badge */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Badge label text */
  children: React.ReactNode;
  /** Show a small dot indicator before the label */
  dot?: boolean;
  /** Additional class names */
  className?: string;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  /** New arrival – soft mint green */
  new: 'bg-accent-mint-100 text-accent-mint-700 border border-accent-mint-200',
  /** Out of stock – muted neutral */
  'out-of-stock': 'bg-secondary-100 text-secondary-500 border border-secondary-200',
  /** Sale / discount – soft rose */
  sale: 'bg-primary-100 text-primary-600 border border-primary-200',
  /** Featured / best seller – soft lavender */
  featured: 'bg-accent-lavender-100 text-accent-lavender-700 border border-accent-lavender-200',
  /** Generic default */
  default: 'bg-cream-200 text-secondary-700 border border-cream-300',
};

/** Dot colour matches the text colour of each variant */
const dotStyles: Record<BadgeVariant, string> = {
  new: 'bg-accent-mint-500',
  'out-of-stock': 'bg-secondary-400',
  sale: 'bg-primary-500',
  featured: 'bg-accent-lavender-500',
  default: 'bg-secondary-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] leading-tight gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Badge atom component.
 *
 * Displays a small label pill for product states such as "New", "Out of Stock",
 * or "Sale". Styled to match the Hiameerah brand aesthetic (soft pastels,
 * rounded corners).
 *
 * Satisfies Requirement 2.7 (out-of-stock badge on product cards).
 *
 * @example
 * <Badge variant="new">New</Badge>
 * <Badge variant="out-of-stock" dot>Out of Stock</Badge>
 * <Badge variant="sale" size="sm">-20%</Badge>
 */
const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}) => {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn('shrink-0 rounded-full', dotStyles[variant], dotSizeStyles[size])}
        />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
