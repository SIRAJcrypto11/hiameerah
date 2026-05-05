/**
 * Shared TypeScript types and interfaces
 */

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  collectionId?: string;
  materials?: string;
  careInstructions?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
}

export interface ProductWithDetails extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
  collection?: Collection;
}

// Category and Collection types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

// Cart types
export interface CartItem {
  id: string;
  userId: string;
  variantId: string;
  quantity: number;
  createdAt: Date;
  variant?: ProductVariant;
  product?: Product;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product?: Product;
}

// Order types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  addressId: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// User types
export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// Content types
export interface HeroBanner {
  id: string;
  title: string;
  caption: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  mobileImageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  author: string;
  publishedAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Filter and sort types
export interface ProductFilters {
  category?: string;
  collection?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'name';

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
