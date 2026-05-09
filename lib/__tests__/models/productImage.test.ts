import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('ProductImage Model', () => {
  let testProduct: { id: string };

  beforeEach(async () => {
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-image',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-image',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create a product image with valid data', async () => {
      const image = await prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://example.com/image1.jpg',
          alt: 'Product Image 1',
          order: 0,
        },
      });

      expect(image).toBeDefined();
      expect(image.url).toBe('https://example.com/image1.jpg');
      expect(image.alt).toBe('Product Image 1');
      expect(image.order).toBe(0);
    });

    it('should set default order value', async () => {
      const image = await prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://example.com/image2.jpg',
          alt: 'Product Image 2',
        },
      });

      expect(image.order).toBe(0);
    });

    it('should allow multiple images with different order values', async () => {
      await prisma.productImage.createMany({
        data: [
          {
            productId: testProduct.id,
            url: 'https://example.com/image1.jpg',
            alt: 'Image 1',
            order: 0,
          },
          {
            productId: testProduct.id,
            url: 'https://example.com/image2.jpg',
            alt: 'Image 2',
            order: 1,
          },
          {
            productId: testProduct.id,
            url: 'https://example.com/image3.jpg',
            alt: 'Image 3',
            order: 2,
          },
        ],
      });

      const images = await prisma.productImage.findMany({
        where: { productId: testProduct.id },
        orderBy: { order: 'asc' },
      });

      expect(images).toHaveLength(3);
      expect(images[0].order).toBe(0);
      expect(images[1].order).toBe(1);
      expect(images[2].order).toBe(2);
    });

    it('should update image order', async () => {
      const image = await prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://example.com/image.jpg',
          alt: 'Image',
          order: 0,
        },
      });

      const updatedImage = await prisma.productImage.update({
        where: { id: image.id },
        data: { order: 5 },
      });

      expect(updatedImage.order).toBe(5);
    });
  });

  describe('Relationships', () => {
    it('should relate to Product', async () => {
      const image = await prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://example.com/image.jpg',
          alt: 'Image',
          order: 0,
        },
        include: {
          product: true,
        },
      });

      expect(image.product).toBeDefined();
      expect(image.product.id).toBe(testProduct.id);
      expect(image.product.name).toBe('Test Product');
    });

    it('should cascade delete when product is deleted', async () => {
      const image = await prisma.productImage.create({
        data: {
          productId: testProduct.id,
          url: 'https://example.com/image.jpg',
          alt: 'Image',
          order: 0,
        },
      });

      await prisma.product.delete({ where: { id: testProduct.id } });

      const deletedImage = await prisma.productImage.findUnique({
        where: { id: image.id },
      });

      expect(deletedImage).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by productId (indexed)', async () => {
      await prisma.productImage.createMany({
        data: [
          {
            productId: testProduct.id,
            url: 'https://example.com/image1.jpg',
            alt: 'Image 1',
            order: 0,
          },
          {
            productId: testProduct.id,
            url: 'https://example.com/image2.jpg',
            alt: 'Image 2',
            order: 1,
          },
        ],
      });

      const images = await prisma.productImage.findMany({
        where: { productId: testProduct.id },
      });

      expect(images).toHaveLength(2);
    });
  });
});
