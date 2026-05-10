import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Display label for this breadcrumb step */
  label: string;
  /**
   * Navigation target. Omit (or leave undefined) for the current page —
   * the last item is rendered as plain text with aria-current="page".
   */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ordered list of navigation steps, last item = current page */
  items: BreadcrumbItem[];
  /** Additional class names for the <nav> wrapper */
  className?: string;
}

// ─── Chevron separator ────────────────────────────────────────────────────────

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-3 w-3 shrink-0', className)}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Breadcrumb molecule component.
 *
 * Renders a semantic navigation trail that shows the user's current location
 * within the site hierarchy (Requirement 13.6).
 *
 * - Each item with an `href` is rendered as a Next.js `<Link>` (clickable).
 * - The last item (current page) is rendered as plain text with
 *   `aria-current="page"` for screen-reader clarity.
 * - Items are separated by a chevron icon (aria-hidden).
 * - Long labels are truncated on mobile via `truncate` / `max-w` utilities.
 * - Brand styling: small text, secondary colour, primary colour on link hover.
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('w-full', className)} data-testid="breadcrumb">
      <ol
        className="flex flex-wrap items-center gap-1 text-xs sm:text-sm"
        data-testid="breadcrumb-list"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
              data-testid={`breadcrumb-item-${index}`}
            >
              {/* Separator — shown before every item except the first */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  data-testid={`breadcrumb-separator-${index}`}
                  className="flex items-center"
                >
                  <ChevronRight className="text-secondary-400" />
                </span>
              )}

              {isLast || !item.href ? (
                /* Current page — plain text, no link */
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'max-w-[10rem] truncate sm:max-w-[16rem]',
                    isLast ? 'font-medium text-secondary-800' : 'text-secondary-500'
                  )}
                  title={item.label}
                  data-testid={`breadcrumb-label-${index}`}
                >
                  {item.label}
                </span>
              ) : (
                /* Ancestor page — clickable link */
                <Link
                  href={item.href}
                  className={cn(
                    'max-w-[10rem] truncate sm:max-w-[16rem]',
                    'text-secondary-500',
                    'transition-colors duration-200',
                    'hover:text-primary-500',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-primary-400 focus-visible:ring-offset-1',
                    'rounded-sm'
                  )}
                  title={item.label}
                  data-testid={`breadcrumb-link-${index}`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
