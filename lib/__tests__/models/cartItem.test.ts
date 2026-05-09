import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('CartItem Model', () => {
  let testUser: { id: string };
  let testVariant: { id: string };

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'cart-test@example.com',
        name: 'Cart Test User',
        password: 'password',
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-cart',
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-cart',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
        variants: {
          create: {
            size: 'M',
            color: 'Red',
            sku: 'TEST-CART-M-RED',
            stock: 10,
          },
        },
      },
      include: { variants: true },
    });

    testVariant = product.variants[0];
  });

  describe('Validations and Constraints', () => {
    it('should create a cart item with valid data', async () => {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 2,
        },
      });

      expect(cartItem).toBeDefined();
      expect(cartItem.userId).toBe(testUser.id);
      expect(cartItem.variantId).toBe(testVariant.id);
      expect(cartItem.quantity).toBe(2);
      expect(cartItem.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique userId-variantId constraint', async () => {
      await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
      });

      await expect(
        prisma.cartItem.create({
          data: {
            userId: testUser.id,
            variantId: testVariant.id, // duplicate combination
            quantity: 2,
          },
        })
      ).rejects.toThrow();
    });

    it('should update quantity of existing cart item', async () => {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
      });

      const updatedCartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: 5 },
      });

      expect(updatedCartItem.quantity).toBe(5);
    });

    it('should allow multiple cart items for different variants', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category 2',
          slug: 'test-category-cart-2',
        },
      });

      const product = await prisma.product.create({
        data: {
          name: 'Test Product 2',
          slug: 'test-product-cart-2',
          description: 'Description',
          price: new Prisma.Decimal(200000),
          categoryId: category.id,
          variants: {
            create: [
              {
                size: 'S',
                color: 'Blue',
                sku: 'TEST-CART-S-BLUE',
                stock: 5,
              },
              {
                size: 'L',
                color: 'Green',
                sku: 'TEST-CART-L-GREEN',
                stock: 8,
              },
            ],
          },
        },
        include: { variants: true },
      });

      await prisma.cartItem.createMany({
        data: [
          {
            userId: testUser.id,
            variantId: product.variants[0].id,
            quantity: 1,
          },
          {
            userId: testUser.id,
            variantId: product.variants[1].id,
            quantity: 2,
          },
        ],
      });

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: testUser.id },
      });

      expect(cartItems).toHaveLength(2);
    });
  });

  describe('Relationships', () => {
    it('should relate to User', async () => {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
        include: {
          user: true,
        },
      });

      expect(cartItem.user).toBeDefined();
      expect(cartItem.user.id).toBe(testUser.id);
      expect(cartItem.user.email).toBe('cart-test@example.com');
    });

    it('should relate to ProductVariant', async () => {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
        include: {
          variant: true,
        },
      });

      expect(cartItem.variant).toBeDefined();
      expect(cartItem.variant.id).toBe(testVariant.id);
      expect(cartItem.variant.sku).toBe('TEST-CART-M-RED');
    });

    it('should cascade delete when user is deleted', async () => {
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
      });

      await prisma.user.delete({ where: { id: testUser.id } });

      const deletedCartItem = await prisma.cartItem.findUnique({
        where: { id: cartItem.id },
      });

      expect(deletedCartItem).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by userId (indexed)', async () => {
      await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          variantId: testVariant.id,
          quantity: 1,
        },
      });

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: testUser.id },
      });

      expect(cartItems).toHaveLength(1);
    });
  });
});
