import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from './lib/prisma';

// Setup before all tests
beforeAll(async () => {
  try {
    // Ensure database connection is ready
    await prisma.$connect();
  } catch {
    // Database may not be available in all test environments (e.g., unit tests)
    // Tests that don't require a DB will still pass
  }
});

// Cleanup after each test
afterEach(async () => {
  try {
    // Clean up test data after each test
    // This ensures tests don't interfere with each other
    const deleteOrderItems = prisma.orderItem.deleteMany();
    const deletePayments = prisma.payment.deleteMany();
    const deleteOrders = prisma.order.deleteMany();
    const deleteCartItems = prisma.cartItem.deleteMany();
    const deleteWishlistItems = prisma.wishlistItem.deleteMany();
    const deleteReviews = prisma.review.deleteMany();
    const deleteProductVariants = prisma.productVariant.deleteMany();
    const deleteProductImages = prisma.productImage.deleteMany();
    const deleteProducts = prisma.product.deleteMany();
    const deleteAddresses = prisma.address.deleteMany();
    const deleteUsers = prisma.user.deleteMany();
    const deleteCollections = prisma.collection.deleteMany();
    const deleteCategories = prisma.category.deleteMany();
    const deleteHeroBanners = prisma.heroBanner.deleteMany();
    const deleteBlogPosts = prisma.blogPost.deleteMany();

    await prisma.$transaction([
      deleteOrderItems,
      deletePayments,
      deleteOrders,
      deleteCartItems,
      deleteWishlistItems,
      deleteReviews,
      deleteProductVariants,
      deleteProductImages,
      deleteProducts,
      deleteAddresses,
      deleteUsers,
      deleteCollections,
      deleteCategories,
      deleteHeroBanners,
      deleteBlogPosts,
    ]);
  } catch {
    // Ignore cleanup errors when DB is not available (unit tests without DB)
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect errors when DB was not connected
  }
});
