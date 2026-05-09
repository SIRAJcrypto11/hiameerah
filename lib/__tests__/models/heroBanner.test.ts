import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('HeroBanner Model', () => {
  describe('Validations and Constraints', () => {
    it('should create a hero banner with valid data', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Welcome to Hiameerah',
          caption: 'Discover our beautiful collection',
          ctaText: 'Shop Now',
          ctaLink: '/products',
          imageUrl: 'https://example.com/banner.jpg',
          mobileImageUrl: 'https://example.com/banner-mobile.jpg',
          order: 1,
          isActive: true,
        },
      });

      expect(banner).toBeDefined();
      expect(banner.title).toBe('Welcome to Hiameerah');
      expect(banner.caption).toBe('Discover our beautiful collection');
      expect(banner.ctaText).toBe('Shop Now');
      expect(banner.ctaLink).toBe('/products');
      expect(banner.imageUrl).toBe('https://example.com/banner.jpg');
      expect(banner.mobileImageUrl).toBe('https://example.com/banner-mobile.jpg');
      expect(banner.order).toBe(1);
      expect(banner.isActive).toBe(true);
      expect(banner.createdAt).toBeInstanceOf(Date);
      expect(banner.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default values correctly', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Default Banner',
          caption: 'Caption',
          ctaText: 'Click',
          ctaLink: '/link',
          imageUrl: 'https://example.com/banner.jpg',
        },
      });

      expect(banner.order).toBe(0);
      expect(banner.isActive).toBe(true);
    });

    it('should allow optional mobileImageUrl to be null', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Banner without mobile image',
          caption: 'Caption',
          ctaText: 'Click',
          ctaLink: '/link',
          imageUrl: 'https://example.com/banner.jpg',
        },
      });

      expect(banner.mobileImageUrl).toBeNull();
    });

    it('should allow multiple banners with different order values', async () => {
      await prisma.heroBanner.createMany({
        data: [
          {
            title: 'Banner 1',
            caption: 'Caption 1',
            ctaText: 'Click',
            ctaLink: '/link1',
            imageUrl: 'https://example.com/banner1.jpg',
            order: 0,
          },
          {
            title: 'Banner 2',
            caption: 'Caption 2',
            ctaText: 'Click',
            ctaLink: '/link2',
            imageUrl: 'https://example.com/banner2.jpg',
            order: 1,
          },
          {
            title: 'Banner 3',
            caption: 'Caption 3',
            ctaText: 'Click',
            ctaLink: '/link3',
            imageUrl: 'https://example.com/banner3.jpg',
            order: 2,
          },
        ],
      });

      const banners = await prisma.heroBanner.findMany({
        orderBy: { order: 'asc' },
      });

      expect(banners).toHaveLength(3);
      expect(banners[0].order).toBe(0);
      expect(banners[1].order).toBe(1);
      expect(banners[2].order).toBe(2);
    });

    it('should update banner order', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Banner',
          caption: 'Caption',
          ctaText: 'Click',
          ctaLink: '/link',
          imageUrl: 'https://example.com/banner.jpg',
          order: 0,
        },
      });

      const updatedBanner = await prisma.heroBanner.update({
        where: { id: banner.id },
        data: { order: 5 },
      });

      expect(updatedBanner.order).toBe(5);
    });

    it('should update isActive status', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Banner',
          caption: 'Caption',
          ctaText: 'Click',
          ctaLink: '/link',
          imageUrl: 'https://example.com/banner.jpg',
          isActive: true,
        },
      });

      const updatedBanner = await prisma.heroBanner.update({
        where: { id: banner.id },
        data: { isActive: false },
      });

      expect(updatedBanner.isActive).toBe(false);
    });

    it('should query only active banners', async () => {
      await prisma.heroBanner.createMany({
        data: [
          {
            title: 'Active Banner 1',
            caption: 'Caption',
            ctaText: 'Click',
            ctaLink: '/link',
            imageUrl: 'https://example.com/banner1.jpg',
            isActive: true,
          },
          {
            title: 'Active Banner 2',
            caption: 'Caption',
            ctaText: 'Click',
            ctaLink: '/link',
            imageUrl: 'https://example.com/banner2.jpg',
            isActive: true,
          },
          {
            title: 'Inactive Banner',
            caption: 'Caption',
            ctaText: 'Click',
            ctaLink: '/link',
            imageUrl: 'https://example.com/banner3.jpg',
            isActive: false,
          },
        ],
      });

      const activeBanners = await prisma.heroBanner.findMany({
        where: { isActive: true },
      });

      expect(activeBanners).toHaveLength(2);
    });

    it('should update banner content', async () => {
      const banner = await prisma.heroBanner.create({
        data: {
          title: 'Original Title',
          caption: 'Original Caption',
          ctaText: 'Original CTA',
          ctaLink: '/original',
          imageUrl: 'https://example.com/original.jpg',
        },
      });

      const updatedBanner = await prisma.heroBanner.update({
        where: { id: banner.id },
        data: {
          title: 'Updated Title',
          caption: 'Updated Caption',
          ctaText: 'Updated CTA',
          ctaLink: '/updated',
          imageUrl: 'https://example.com/updated.jpg',
        },
      });

      expect(updatedBanner.title).toBe('Updated Title');
      expect(updatedBanner.caption).toBe('Updated Caption');
      expect(updatedBanner.ctaText).toBe('Updated CTA');
      expect(updatedBanner.ctaLink).toBe('/updated');
      expect(updatedBanner.imageUrl).toBe('https://example.com/updated.jpg');
    });
  });
});
