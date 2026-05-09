import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('ProductVariant Model', () => {
  let testProduct: { id: string };

  beforeEach(async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-variant',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-variant',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create a product variant with valid data', async () => {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'M',
          color: 'Red',
          sku: 'TEST-M-RED',
          stock: 10,
        },
      });

      expect(variant).toBeDefined();
      expect(variant.size).toBe('M');
      expect(variant.color).toBe('Red');
      expect(variant.sku).toBe('TEST-M-RED');
      expect(variant.stock).toBe(10);
    });

    it('should enforce unique SKU constraint', async () => {
      await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'M',
          color: 'Red',
          sku: 'UNIQUE-SKU',
          stock: 10,
        },
      });

      await expect(
        prisma.productVariant.create({
          data: {
            productId: testProduct.id,
            size: 'L',
            color: 'Blue',
            sku: 'UNIQUE-SKU', // duplicate SKU
            stock: 5,
          },
        })
      ).rejects.toThrow();
    });

    it('should set default stock value', async () => {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'S',
          color: 'Green',
          sku: 'TEST-S-GREEN',
        },
      });

      expect(variant.stock).toBe(0);
    });

    it('should update stock quantity', async () => {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'L',
          color: 'Blue',
          sku: 'TEST-L-BLUE',
          stock: 10,
        },
      });

      const updatedVariant = await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: 5 },
      });

      expect(updatedVariant.stock).toBe(5);
    });
  });

  describe('Relationships', () => {
    it('should relate to Product', async () => {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'M',
          color: 'Red',
          sku: 'TEST-REL-M-RED',
          stock: 10,
        },
        include: {
          product: true,
        },
      });

      expect(variant.product).toBeDefined();
      expect(variant.product.id).toBe(testProduct.id);
      expect(variant.product.name).toBe('Test Product');
    });

    it('should cascade delete when product is deleted', async () => {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'M',
          color: 'Red',
          sku: 'TEST-CASCADE-M-RED',
          stock: 10,
        },
      });

      await prisma.product.delete({ where: { id: testProduct.id } });

      const deletedVariant = await prisma.productVariant.findUnique({
        where: { id: variant.id },
      });

      expect(deletedVariant).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by SKU (indexed)', async () => {
      await prisma.productVariant.create({
        data: {
          productId: testProduct.id,
          size: 'M',
          color: 'Red',
          sku: 'INDEXED-SKU',
          stock: 10,
        },
      });

      const variant = await prisma.productVariant.findUnique({
        where: { sku: 'INDEXED-SKU' },
      });

      expect(variant).toBeDefined();
      expect(variant?.sku).toBe('INDEXED-SKU');
    });

    it('should efficiently query by productId (indexed)', async () => {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: testProduct.id,
            size: 'S',
            color: 'Red',
            sku: 'TEST-S-RED-1',
            stock: 10,
          },
          {
            productId: testProduct.id,
            size: 'M',
            color: 'Blue',
            sku: 'TEST-M-BLUE-1',
            stock: 5,
          },
        ],
      });

      const variants = await prisma.productVariant.findMany({
        where: { productId: testProduct.id },
      });

      expect(variants).toHaveLength(2);
    });
  });
});
