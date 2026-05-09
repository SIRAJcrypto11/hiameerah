import React, { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Predefined aspect ratio presets.
 *
 * - `product`  → 3:4  (portrait, used for all product images – Req 30.3)
 * - `banner`   → 16:9 (landscape, used for hero banners)
 * - `square`   → 1:1
 * - `auto`     → no enforced ratio (use with fill or explicit width/height)
 */
export type ImageAspectRatio = 'product' | 'banner' | 'square' | 'auto';

export interface ImageProps extends Omit<
  NextImageProps,
  'onError' | 'onLoad' | 'placeholder' | 'blurDataURL'
> {
  /**
   * Aspect ratio preset for the image container.
   * Ignored when `fill` is true (parent controls dimensions).
   * @default 'auto'
   */
  aspectRatio?: ImageAspectRatio;
  /**
   * Custom blur placeholder data URL.
   * When omitted a built-in 1×1 pixel SVG blur is used (Req 30.7).
   */
  blurDataURL?: string;
  /**
   * Node rendered when the image fails to load (Req 30.7 error fallback).
   * Defaults to a neutral skeleton placeholder.
   */
  fallback?: React.ReactNode;
  /** Additional class names for the outer wrapper element. */
  wrapperClassName?: string;
  /** Additional class names applied to the <img> element. */
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Aspect ratio Tailwind classes for the wrapper */
const aspectRatioClasses: Record<ImageAspectRatio, string> = {
  product: 'aspect-[3/4]',
  banner: 'aspect-video',
  square: 'aspect-square',
  auto: '',
};

/**
 * Minimal 1×1 pixel SVG encoded as a data URL.
 * Used as the default blur placeholder so the browser always has something
 * to show while the real image loads (progressive loading – Req 30.7).
 */
const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

// ─── Default fallback ─────────────────────────────────────────────────────────

/**
 * Default error fallback: a neutral skeleton that matches the container size.
 */
function DefaultFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-cream-100"
      aria-hidden="true"
      data-testid="image-fallback"
    >
      {/* Simple image-broken icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-secondary-300"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Image atom component.
 *
 * Wraps Next.js `<Image>` with:
 * - Progressive loading via blur placeholder (Req 30.7, 16.3)
 * - Error fallback when the image fails to load (Req 30.7)
 * - Aspect ratio support via container wrapper (Req 30.3)
 * - Fill mode support for flexible layouts
 * - WebP/AVIF optimisation handled by Next.js (Req 30.6)
 *
 * The `alt` prop is required to ensure accessibility (Req 17.7, 18.7).
 */
const Image = React.forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      alt,
      aspectRatio = 'auto',
      blurDataURL,
      fallback,
      fill = false,
      wrapperClassName,
      className,
      sizes,
      priority = false,
      quality,
      width,
      height,
      ...rest
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const resolvedBlurDataURL = blurDataURL ?? DEFAULT_BLUR_DATA_URL;
    const resolvedFallback = fallback ?? <DefaultFallback />;

    // When fill is true the wrapper must be positioned (relative/absolute/fixed)
    // and the aspect ratio class is not applied (parent controls dimensions).
    const wrapperClasses = cn(
      'relative overflow-hidden',
      !fill && aspectRatioClasses[aspectRatio],
      wrapperClassName
    );

    return (
      <div ref={ref} className={wrapperClasses}>
        {/* Error fallback – shown when image fails to load */}
        {hasError && resolvedFallback}

        {/* Next.js Image – hidden on error */}
        {!hasError && (
          <NextImage
            src={src}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            sizes={
              sizes ?? (fill ? '100vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw')
            }
            priority={priority}
            quality={quality ?? 85}
            // Progressive loading: show blur placeholder while loading (Req 30.7)
            placeholder="blur"
            blurDataURL={resolvedBlurDataURL}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              // Smooth fade-in once loaded
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              // When not using fill, make the image fill its container
              !fill && 'h-full w-full object-cover',
              className
            )}
            {...rest}
          />
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export default Image;
