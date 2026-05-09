import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('Product Model', () => {
  let testCategory: { id: string };

  beforeEach(async () => {
    // Create a test category for product tests
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        order: 0,
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create a product with valid data', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Hijab',
          slug: 'test-hijab',
          description: 'A beautiful test hijab',
          price: new Prisma.Decimal(150000),
          categoryId: testCategory.id,
          isActive: true,
        },
      });

      expect(product).toBeDefined();
      expect(product.name).toBe('Test Hijab');
      expect(product.slug).toBe('test-hijab');
      expect(product.price.toString()).toBe('150000');
      expect(product.isActive).toBe(true);
      expect(product.isFeatured).toBe(false); // default value
      expect(product.isNew).toBe(false); // default value
    });

    it('should enforce unique slug constraint', async () => {
      await prisma.product.create({
        data: {
          name: 'Product 1',
          slug: 'unique-slug',
          description: 'Description',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
        },
      });

      await expect(
        prisma.product.create({
          data: {
            name: 'Product 2',
            slug: 'unique-slug', // duplicate slug
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: testCategory.id,
          },
        })
      ).rejects.toThrow();
    });

    it('should require categoryId (foreign key constraint)', async () => {
      await expect(
        prisma.product.create({
          data: {
            name: 'Test Product',
            slug: 'test-product',
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: 'non-existent-id',
          },
        })
      ).rejects.toThrow();
    });

    it('should handle decimal price correctly', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Expensive Hijab',
          slug: 'expensive-hijab',
          description: 'A premium hijab',
          price: new Prisma.Decimal(1234567.89),
          categoryId: testCategory.id,
        },
      });

      expect(product.price.toString()).toBe('1234567.89');
    });

    it('should set default values correctly', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Default Test',
          slug: 'default-test',
          description: 'Testing defaults',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
        },
      });

      expect(product.isActive).toBe(true);
      expect(product.isFeatured).toBe(false);
      expect(product.isNew).toBe(false);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow optional fields to be null', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Minimal Product',
          slug: 'minimal-product',
          description: 'Minimal data',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
        },
      });

      expect(product.collectionId).toBeNull();
      expect(product.materials).toBeNull();
      expect(product.careInstructions).toBeNull();
    });
  });

  describe('Relationships', () => {
    it('should relate to Category', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product-rel',
          description: 'Testing relationship',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
        },
        include: {
          category: true,
        },
      });

      expect(product.category).toBeDefined();
      expect(product.category.id).toBe(testCategory.id);
      expect(product.category.name).toBe('Test Category');
    });

    it('should relate to Collection (optional)', async () => {
      const collection = await prisma.collection.create({
        data: {
          name: 'Test Collection',
          slug: 'test-collection',
          order: 0,
        },
      });

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product-coll',
          description: 'Testing collection relationship',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
          collectionId: collection.id,
        },
        include: {
          collection: true,
        },
      });

      expect(product.collection).toBeDefined();
      expect(product.collection?.id).toBe(collection.id);
    });

    it('should have ProductImage relationship (one-to-many)', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product-images',
          description: 'Testing images',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
          images: {
            create: [
              { url: 'https://example.com/image1.jpg', alt: 'Image 1', order: 0 },
              { url: 'https://example.com/image2.jpg', alt: 'Image 2', order: 1 },
            ],
          },
        },
        include: {
          images: true,
        },
      });

      expect(product.images).toHaveLength(2);
      expect(product.images[0].url).toBe('https://example.com/image1.jpg');
      expect(product.images[1].url).toBe('https://example.com/image2.jpg');
    });

    it('should have ProductVariant relationship (one-to-many)', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product-variants',
          description: 'Testing variants',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
          variants: {
            create: [
              { size: 'S', color: 'Red', sku: 'TEST-S-RED', stock: 10 },
              { size: 'M', color: 'Blue', sku: 'TEST-M-BLUE', stock: 5 },
            ],
          },
        },
        include: {
          variants: true,
        },
      });

      expect(product.variants).toHaveLength(2);
      expect(product.variants[0].size).toBe('S');
      expect(product.variants[1].size).toBe('M');
    });

    it('should cascade delete ProductImages when product is deleted', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-cascade-images',
          description: 'Testing cascade delete',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
          images: {
            create: [{ url: 'https://example.com/image.jpg', alt: 'Image', order: 0 }],
          },
        },
        include: {
          images: true,
        },
      });

      const imageId = product.images[0].id;

      await prisma.product.delete({ where: { id: product.id } });

      const deletedImage = await prisma.productImage.findUnique({
        where: { id: imageId },
      });

      expect(deletedImage).toBeNull();
    });

    it('should cascade delete ProductVariants when product is deleted', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-cascade-variants',
          description: 'Testing cascade delete',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
          variants: {
            create: [{ size: 'S', color: 'Red', sku: 'TEST-CASCADE', stock: 10 }],
          },
        },
        include: {
          variants: true,
        },
      });

      const variantId = product.variants[0].id;

      await prisma.product.delete({ where: { id: product.id } });

      const deletedVariant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      expect(deletedVariant).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by slug (indexed)', async () => {
      await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'indexed-slug',
          description: 'Testing index',
          price: new Prisma.Decimal(100000),
          categoryId: testCategory.id,
        },
      });

      const product = await prisma.product.findUnique({
        where: { slug: 'indexed-slug' },
      });

      expect(product).toBeDefined();
      expect(product?.slug).toBe('indexed-slug');
    });

    it('should efficiently query by categoryId (indexed)', async () => {
      await prisma.product.createMany({
        data: [
          {
            name: 'Product 1',
            slug: 'product-1',
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: testCategory.id,
          },
          {
            name: 'Product 2',
            slug: 'product-2',
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: testCategory.id,
          },
        ],
      });

      const products = await prisma.product.findMany({
        where: { categoryId: testCategory.id },
      });

      expect(products).toHaveLength(2);
    });

    it('should efficiently query by isActive (indexed)', async () => {
      await prisma.product.createMany({
        data: [
          {
            name: 'Active Product',
            slug: 'active-product',
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: testCategory.id,
            isActive: true,
          },
          {
            name: 'Inactive Product',
            slug: 'inactive-product',
            description: 'Description',
            price: new Prisma.Decimal(100000),
            categoryId: testCategory.id,
            isActive: false,
          },
        ],
      });

      const activeProducts = await prisma.product.findMany({
        where: { isActive: true },
      });

      expect(activeProducts).toHaveLength(1);
      expect(activeProducts[0].name).toBe('Active Product');
    });
  });
});
