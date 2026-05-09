import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/generated/prisma';

describe('User Model', () => {
  describe('Validations and Constraints', () => {
    it('should create a user with valid data', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed_password_123',
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe(UserRole.CUSTOMER); // default value
      expect(user.emailVerified).toBe(false); // default value
    });

    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          email: 'unique@example.com',
          name: 'User 1',
          password: 'password123',
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email: 'unique@example.com', // duplicate email
            name: 'User 2',
            password: 'password456',
          },
        })
      ).rejects.toThrow();
    });

    it('should create an admin user', async () => {
      const admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: 'admin_password',
          role: UserRole.ADMIN,
        },
      });

      expect(admin.role).toBe(UserRole.ADMIN);
    });

    it('should set default values correctly', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'defaults@example.com',
          name: 'Default User',
          password: 'password',
        },
      });

      expect(user.role).toBe(UserRole.CUSTOMER);
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update emailVerified status', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'verify@example.com',
          name: 'Verify User',
          password: 'password',
        },
      });

      expect(user.emailVerified).toBe(false);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      expect(updatedUser.emailVerified).toBe(true);
    });
  });

  describe('Relationships', () => {
    it('should have Address relationship (one-to-many)', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'address@example.com',
          name: 'Address User',
          password: 'password',
          addresses: {
            create: [
              {
                fullName: 'John Doe',
                phone: '081234567890',
                street: 'Jl. Test No. 123',
                city: 'Jakarta',
                province: 'DKI Jakarta',
                postalCode: '12345',
                isDefault: true,
              },
              {
                fullName: 'John Doe',
                phone: '081234567890',
                street: 'Jl. Alternative No. 456',
                city: 'Bandung',
                province: 'Jawa Barat',
                postalCode: '54321',
                isDefault: false,
              },
            ],
          },
        },
        include: {
          addresses: true,
        },
      });

      expect(user.addresses).toHaveLength(2);
      expect(user.addresses[0].city).toBe('Jakarta');
      expect(user.addresses[1].city).toBe('Bandung');
    });

    it('should have CartItem relationship (one-to-many)', async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category', slug: 'test-category', order: 0 },
      });

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Description',
          price: 100000,
          categoryId: category.id,
          variants: {
            create: {
              size: 'M',
              color: 'Red',
              sku: 'TEST-M-RED',
              stock: 10,
            },
          },
        },
        include: { variants: true },
      });

      const user = await prisma.user.create({
        data: {
          email: 'cart@example.com',
          name: 'Cart User',
          password: 'password',
          cart: {
            create: {
              variantId: product.variants[0].id,
              quantity: 2,
            },
          },
        },
        include: {
          cart: true,
        },
      });

      expect(user.cart).toHaveLength(1);
      expect(user.cart[0].quantity).toBe(2);
    });

    it('should have WishlistItem relationship (one-to-many)', async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category', slug: 'test-category-wish', order: 0 },
      });

      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          slug: 'test-product-wish',
          description: 'Description',
          price: 100000,
          categoryId: category.id,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: 'wishlist@example.com',
          name: 'Wishlist User',
          password: 'password',
          wishlist: {
            create: {
              productId: product.id,
            },
          },
        },
        include: {
          wishlist: true,
        },
      });

      expect(user.wishlist).toHaveLength(1);
      expect(user.wishlist[0].productId).toBe(product.id);
    });

    it('should cascade delete related data when user is deleted', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'cascade@example.com',
          name: 'Cascade User',
          password: 'password',
          addresses: {
            create: {
              fullName: 'Test User',
              phone: '081234567890',
              street: 'Jl. Test',
              city: 'Jakarta',
              province: 'DKI Jakarta',
              postalCode: '12345',
            },
          },
        },
        include: { addresses: true },
      });

      const addressId = user.addresses[0].id;

      await prisma.user.delete({ where: { id: user.id } });

      const deletedAddress = await prisma.address.findUnique({
        where: { id: addressId },
      });

      expect(deletedAddress).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by email (indexed)', async () => {
      await prisma.user.create({
        data: {
          email: 'indexed@example.com',
          name: 'Indexed User',
          password: 'password',
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: 'indexed@example.com' },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe('indexed@example.com');
    });
  });
});
