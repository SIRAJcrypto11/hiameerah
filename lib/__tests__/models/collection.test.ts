import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Collection Model', () => {
  describe('Validations and Constraints', () => {
    it('should create a collection with valid data', async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Koleksi Budaya Indonesia',
          slug: 'koleksi-budaya-indonesia',
          description: 'Inspired by Indonesian culture',
          heroImageUrl: 'https://example.com/hero.jpg',
          isActive: true,
          order: 1,
        },
      });

      expect(collection).toBeDefined();
      expect(collection.name).toBe('Koleksi Budaya Indonesia');
      expect(collection.slug).toBe('koleksi-budaya-indonesia');
      expect(collection.isActive).toBe(true);
      expect(collection.order).toBe(1);
      expect(collection.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique name constraint', async () => {
      await prisma.collection.create({
        data: {
          name: 'Unique Collection',
          slug: 'unique-collection',
        },
      });

      await expect(
        prisma.collection.create({
          data: {
            name: 'Unique Collection', // duplicate name
            slug: 'unique-collection-2',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique slug constraint', async () => {
      await prisma.collection.create({
        data: {
          name: 'Collection 1',
          slug: 'unique-slug',
        },
      });

      await expect(
        prisma.collection.create({
          data: {
            name: 'Collection 2',
            slug: 'unique-slug', // duplicate slug
          },
        })
      ).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Default Collection',
          slug: 'default-collection',
        },
      });

      expect(collection.isActive).toBe(true);
      expect(collection.order).toBe(0);
    });

    it('should allow optional fields to be null', async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Minimal Collection',
          slug: 'minimal-collection',
        },
      });

      expect(collection.description).toBeNull();
      expect(collection.heroImageUrl).toBeNull();
    });
  });

  describe('Relationships', () => {
    it('should have Product relationship (one-to-many)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category-coll',
        },
      });

      const collection = await prisma.collection.create({
        data: {
          name: 'Test Collection',
          slug: 'test-collection-rel',
          products: {
            create: [
              {
                name: 'Product 1',
                slug: 'product-1-coll',
                description: 'Description',
                price: 100000,
                categoryId: category.id,
              },
              {
                name: 'Product 2',
                slug: 'product-2-coll',
                description: 'Description',
                price: 150000,
                categoryId: category.id,
              },
            ],
          },
        },
        include: {
          products: true,
        },
      });

      expect(collection.products).toHaveLength(2);
      expect(collection.products[0].name).toBe('Product 1');
      expect(collection.products[1].name).toBe('Product 2');
    });
  });
});
