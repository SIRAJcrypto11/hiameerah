import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Category Model', () => {
  describe('Validations and Constraints', () => {
    it('should create a category with valid data', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Hijab',
          slug: 'hijab',
          description: 'Beautiful hijab collection',
          imageUrl: 'https://example.com/hijab.jpg',
          order: 1,
        },
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Hijab');
      expect(category.slug).toBe('hijab');
      expect(category.order).toBe(1);
    });

    it('should enforce unique name constraint', async () => {
      await prisma.category.create({
        data: {
          name: 'Unique Category',
          slug: 'unique-category',
          order: 0,
        },
      });

      await expect(
        prisma.category.create({
          data: {
            name: 'Unique Category', // duplicate name
            slug: 'unique-category-2',
            order: 0,
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique slug constraint', async () => {
      await prisma.category.create({
        data: {
          name: 'Category 1',
          slug: 'unique-slug',
          order: 0,
        },
      });

      await expect(
        prisma.category.create({
          data: {
            name: 'Category 2',
            slug: 'unique-slug', // duplicate slug
            order: 0,
          },
        })
      ).rejects.toThrow();
    });

    it('should set default order value', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Default Order',
          slug: 'default-order',
        },
      });

      expect(category.order).toBe(0);
    });

    it('should allow optional fields to be null', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Minimal Category',
          slug: 'minimal-category',
        },
      });

      expect(category.description).toBeNull();
      expect(category.imageUrl).toBeNull();
    });
  });

  describe('Relationships', () => {
    it('should have Product relationship (one-to-many)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category-rel',
          products: {
            create: [
              {
                name: 'Product 1',
                slug: 'product-1',
                description: 'Description',
                price: 100000,
              },
              {
                name: 'Product 2',
                slug: 'product-2',
                description: 'Description',
                price: 150000,
              },
            ],
          },
        },
        include: {
          products: true,
        },
      });

      expect(category.products).toHaveLength(2);
      expect(category.products[0].name).toBe('Product 1');
      expect(category.products[1].name).toBe('Product 2');
    });
  });
});
