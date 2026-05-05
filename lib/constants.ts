/**
 * Application-wide constants
 */

// Pagination
export const PRODUCTS_PER_PAGE = 20;
export const PRODUCTS_PRELOAD_THRESHOLD = 500; // pixels from bottom

// Slideshow
export const SLIDESHOW_INTERVAL = 5000; // 5 seconds
export const SLIDESHOW_TRANSITION_DURATION = 400; // 400ms

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  modal: 300,
  hover: 200,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Grid columns by breakpoint
export const GRID_COLUMNS = {
  mobile: 1, // < 480px
  mobileLarge: 2, // 480-768px
  tablet: 3, // 768-1024px
  desktop: 4, // > 1024px
} as const;

// Touch target minimum size (accessibility)
export const MIN_TOUCH_TARGET = 44; // 44x44 pixels

// Image optimization
export const IMAGE_QUALITY = 85;
export const IMAGE_FORMATS = ['image/webp', 'image/avif'] as const;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_MAX_SUGGESTIONS = 8;

// Cart
export const CART_STORAGE_KEY = 'hiameerah-cart';
export const WISHLIST_STORAGE_KEY = 'hiameerah-wishlist';
export const RECENTLY_VIEWED_KEY = 'hiameerah-recently-viewed';
export const MAX_RECENTLY_VIEWED = 8;

// Order
export const MIN_ORDER_VALUE = 50000; // Rp 50,000
export const MAX_ITEMS_PER_ORDER = 50;

// Notifications
export const NOTIFICATION_DURATION = 3000; // 3 seconds

// Performance
export const CACHE_DURATION = {
  static: 60 * 60 * 24 * 30, // 30 days
  dynamic: 60 * 5, // 5 minutes
} as const;

// SEO
export const SITE_NAME = 'Hiameerah';
export const SITE_DESCRIPTION =
  'Brand hijab dan modest fashion Indonesia yang terinspirasi dari keindahan dan budaya Indonesia. Lahir 25 Desember 2019.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiameerah.com';
