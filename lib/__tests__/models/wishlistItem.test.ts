import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('WishlistItem Model', () => {
  let testUser: { id: string };
  let testProduct: { id: string };

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'wishlist-test@example.com',
        name: 'Wishlist Test User',
        password: 'password',
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-wishlist',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-wishlist',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create a wishlist item with valid data', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      expect(wishlistItem).toBeDefined();
      expect(wishlistItem.userId).toBe(testUser.id);
      expect(wishlistItem.productId).toBe(testProduct.id);
      expect(wishlistItem.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique userId-productId constraint', async () => {
      await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      await expect(
        prisma.wishlistItem.create({
          data: {
            userId: testUser.id,
            productId: testProduct.id, // duplicate combination
          },
        })
      ).rejects.toThrow();
    });

    it('should allow multiple wishlist items for different products', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category 2',
          slug: 'test-category-wishlist-2',
        },
      });

      const product2 = await prisma.product.create({
        data: {
          name: 'Test Product 2',
          slug: 'test-product-wishlist-2',
          description: 'Description',
          price: new Prisma.Decimal(200000),
          categoryId: category.id,
        },
      });

      await prisma.wishlistItem.createMany({
        data: [
          {
            userId: testUser.id,
            productId: testProduct.id,
          },
          {
            userId: testUser.id,
            productId: product2.id,
          },
        ],
      });

      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: testUser.id },
      });

      expect(wishlistItems).toHaveLength(2);
    });

    it('should remove wishlist item', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      await prisma.wishlistItem.delete({ where: { id: wishlistItem.id } });

      const deletedItem = await prisma.wishlistItem.findUnique({
        where: { id: wishlistItem.id },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe('Relationships', () => {
    it('should relate to User', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
        include: {
          user: true,
        },
      });

      expect(wishlistItem.user).toBeDefined();
      expect(wishlistItem.user.id).toBe(testUser.id);
      expect(wishlistItem.user.email).toBe('wishlist-test@example.com');
    });

    it('should relate to Product', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
        include: {
          product: true,
        },
      });

      expect(wishlistItem.product).toBeDefined();
      expect(wishlistItem.product.id).toBe(testProduct.id);
      expect(wishlistItem.product.name).toBe('Test Product');
    });

    it('should cascade delete when user is deleted', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      await prisma.user.delete({ where: { id: testUser.id } });

      const deletedItem = await prisma.wishlistItem.findUnique({
        where: { id: wishlistItem.id },
      });

      expect(deletedItem).toBeNull();
    });

    it('should cascade delete when product is deleted', async () => {
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      await prisma.product.delete({ where: { id: testProduct.id } });

      const deletedItem = await prisma.wishlistItem.findUnique({
        where: { id: wishlistItem.id },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by userId (indexed)', async () => {
      await prisma.wishlistItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
        },
      });

      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: testUser.id },
      });

      expect(wishlistItems).toHaveLength(1);
    });
  });
});
