import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('BlogPost Model', () => {
  describe('Validations and Constraints', () => {
    it('should create a blog post with valid data', async () => {
      const blogPost = await prisma.blogPost.create({
        data: {
          title: 'How to Style Your Hijab',
          slug: 'how-to-style-your-hijab',
          excerpt: 'Learn the best ways to style your hijab for different occasions',
          content: 'Full article content goes here...',
          featuredImage: 'https://example.com/blog-image.jpg',
          category: 'Styling Tips',
          author: 'Hiameerah Team',
          publishedAt: new Date(),
          isPublished: true,
        },
      });

      expect(blogPost).toBeDefined();
      expect(blogPost.title).toBe('How to Style Your Hijab');
      expect(blogPost.slug).toBe('how-to-style-your-hijab');
      expect(blogPost.excerpt).toBe(
        'Learn the best ways to style your hijab for different occasions'
      );
      expect(blogPost.category).toBe('Styling Tips');
      expect(blogPost.author).toBe('Hiameerah Team');
      expect(blogPost.isPublished).toBe(true);
      expect(blogPost.publishedAt).toBeInstanceOf(Date);
      expect(blogPost.createdAt).toBeInstanceOf(Date);
      expect(blogPost.updatedAt).toBeInstanceOf(Date);
    });

    it('should enforce unique slug constraint', async () => {
      await prisma.blogPost.create({
        data: {
          title: 'Post 1',
          slug: 'unique-slug',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Category',
          author: 'Author',
        },
      });

      await expect(
        prisma.blogPost.create({
          data: {
            title: 'Post 2',
            slug: 'unique-slug', // duplicate slug
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
          },
        })
      ).rejects.toThrow();
    });

    it('should set default isPublished value', async () => {
      const blogPost = await prisma.blogPost.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Category',
          author: 'Author',
        },
      });

      expect(blogPost.isPublished).toBe(false);
    });

    it('should allow publishedAt to be null for drafts', async () => {
      const blogPost = await prisma.blogPost.create({
        data: {
          title: 'Draft Post',
          slug: 'draft-post-2',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Category',
          author: 'Author',
          isPublished: false,
        },
      });

      expect(blogPost.publishedAt).toBeNull();
    });

    it('should query only published posts', async () => {
      await prisma.blogPost.createMany({
        data: [
          {
            title: 'Published Post 1',
            slug: 'published-post-1',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            title: 'Published Post 2',
            slug: 'published-post-2',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            title: 'Draft Post',
            slug: 'draft-post-3',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
            isPublished: false,
          },
        ],
      });

      const publishedPosts = await prisma.blogPost.findMany({
        where: { isPublished: true },
      });

      expect(publishedPosts).toHaveLength(2);
    });

    it('should query posts by category', async () => {
      await prisma.blogPost.createMany({
        data: [
          {
            title: 'Styling Post 1',
            slug: 'styling-post-1',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Styling Tips',
            author: 'Author',
          },
          {
            title: 'Styling Post 2',
            slug: 'styling-post-2',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Styling Tips',
            author: 'Author',
          },
          {
            title: 'Culture Post',
            slug: 'culture-post',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Culture',
            author: 'Author',
          },
        ],
      });

      const stylingPosts = await prisma.blogPost.findMany({
        where: { category: 'Styling Tips' },
      });

      expect(stylingPosts).toHaveLength(2);
    });

    it('should update blog post', async () => {
      const blogPost = await prisma.blogPost.create({
        data: {
          title: 'Original Title',
          slug: 'original-slug',
          excerpt: 'Original excerpt',
          content: 'Original content',
          featuredImage: 'https://example.com/original.jpg',
          category: 'Original Category',
          author: 'Original Author',
          isPublished: false,
        },
      });

      const updatedPost = await prisma.blogPost.update({
        where: { id: blogPost.id },
        data: {
          title: 'Updated Title',
          excerpt: 'Updated excerpt',
          content: 'Updated content',
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      expect(updatedPost.title).toBe('Updated Title');
      expect(updatedPost.excerpt).toBe('Updated excerpt');
      expect(updatedPost.content).toBe('Updated content');
      expect(updatedPost.isPublished).toBe(true);
      expect(updatedPost.publishedAt).toBeInstanceOf(Date);
    });

    it('should schedule blog post for future publication', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

      const blogPost = await prisma.blogPost.create({
        data: {
          title: 'Scheduled Post',
          slug: 'scheduled-post',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Category',
          author: 'Author',
          publishedAt: futureDate,
          isPublished: false,
        },
      });

      expect(blogPost.publishedAt).toBeInstanceOf(Date);
      expect(blogPost.publishedAt?.getTime()).toBeGreaterThan(Date.now());
      expect(blogPost.isPublished).toBe(false);
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by slug (indexed)', async () => {
      await prisma.blogPost.create({
        data: {
          title: 'Test Post',
          slug: 'indexed-slug',
          excerpt: 'Excerpt',
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'Category',
          author: 'Author',
        },
      });

      const blogPost = await prisma.blogPost.findUnique({
        where: { slug: 'indexed-slug' },
      });

      expect(blogPost).toBeDefined();
      expect(blogPost?.slug).toBe('indexed-slug');
    });

    it('should efficiently query by isPublished (indexed)', async () => {
      await prisma.blogPost.createMany({
        data: [
          {
            title: 'Published Post',
            slug: 'published-post-idx',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
            isPublished: true,
          },
          {
            title: 'Draft Post',
            slug: 'draft-post-idx',
            excerpt: 'Excerpt',
            content: 'Content',
            featuredImage: 'https://example.com/image.jpg',
            category: 'Category',
            author: 'Author',
            isPublished: false,
          },
        ],
      });

      const publishedPosts = await prisma.blogPost.findMany({
        where: { isPublished: true },
      });

      expect(publishedPosts.length).toBeGreaterThanOrEqual(1);
    });
  });
});
