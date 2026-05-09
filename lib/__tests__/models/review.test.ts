import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('Review Model', () => {
  let testUser: { id: string };
  let testProduct: { id: string };

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'review-test@example.com',
        name: 'Review Test User',
        password: 'password',
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-review',
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-review',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create a review with valid data', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Excellent Product',
          comment: 'This is a great product. Highly recommended!',
          isVerified: true,
        },
      });

      expect(review).toBeDefined();
      expect(review.productId).toBe(testProduct.id);
      expect(review.userId).toBe(testUser.id);
      expect(review.rating).toBe(5);
      expect(review.title).toBe('Excellent Product');
      expect(review.comment).toBe('This is a great product. Highly recommended!');
      expect(review.isVerified).toBe(true);
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it('should set default isVerified value', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 4,
          title: 'Good Product',
          comment: 'Nice quality',
        },
      });

      expect(review.isVerified).toBe(false);
    });

    it('should allow ratings from 1 to 5', async () => {
      const ratings = [1, 2, 3, 4, 5];

      for (const rating of ratings) {
        const review = await prisma.review.create({
          data: {
            productId: testProduct.id,
            userId: testUser.id,
            rating,
            title: `Rating ${rating}`,
            comment: `This product deserves ${rating} stars`,
          },
        });

        expect(review.rating).toBe(rating);
      }
    });

    it('should allow multiple reviews per product', async () => {
      const user2 = await prisma.user.create({
        data: {
          email: 'review-test-2@example.com',
          name: 'Review Test User 2',
          password: 'password',
        },
      });

      await prisma.review.createMany({
        data: [
          {
            productId: testProduct.id,
            userId: testUser.id,
            rating: 5,
            title: 'Great',
            comment: 'Excellent',
          },
          {
            productId: testProduct.id,
            userId: user2.id,
            rating: 4,
            title: 'Good',
            comment: 'Nice',
          },
        ],
      });

      const reviews = await prisma.review.findMany({
        where: { productId: testProduct.id },
      });

      expect(reviews).toHaveLength(2);
    });

    it('should update isVerified status', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent quality',
          isVerified: false,
        },
      });

      const updatedReview = await prisma.review.update({
        where: { id: review.id },
        data: { isVerified: true },
      });

      expect(updatedReview.isVerified).toBe(true);
    });
  });

  describe('Relationships', () => {
    it('should relate to Product', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
        include: {
          product: true,
        },
      });

      expect(review.product).toBeDefined();
      expect(review.product.id).toBe(testProduct.id);
      expect(review.product.name).toBe('Test Product');
    });

    it('should relate to User', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
        include: {
          user: true,
        },
      });

      expect(review.user).toBeDefined();
      expect(review.user.id).toBe(testUser.id);
      expect(review.user.email).toBe('review-test@example.com');
    });

    it('should cascade delete when product is deleted', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
      });

      await prisma.product.delete({ where: { id: testProduct.id } });

      const deletedReview = await prisma.review.findUnique({
        where: { id: review.id },
      });

      expect(deletedReview).toBeNull();
    });

    it('should cascade delete when user is deleted', async () => {
      const review = await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
      });

      await prisma.user.delete({ where: { id: testUser.id } });

      const deletedReview = await prisma.review.findUnique({
        where: { id: review.id },
      });

      expect(deletedReview).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by productId (indexed)', async () => {
      await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
      });

      const reviews = await prisma.review.findMany({
        where: { productId: testProduct.id },
      });

      expect(reviews).toHaveLength(1);
    });

    it('should efficiently query by userId (indexed)', async () => {
      await prisma.review.create({
        data: {
          productId: testProduct.id,
          userId: testUser.id,
          rating: 5,
          title: 'Great Product',
          comment: 'Excellent',
        },
      });

      const reviews = await prisma.review.findMany({
        where: { userId: testUser.id },
      });

      expect(reviews).toHaveLength(1);
    });
  });
});
