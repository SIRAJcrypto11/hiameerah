import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Address Model', () => {
  let testUser: { id: string };

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'address-test@example.com',
        name: 'Address Test User',
        password: 'password',
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create an address with valid data', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          fullName: 'John Doe',
          phone: '081234567890',
          street: 'Jl. Sudirman No. 123',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
          isDefault: true,
        },
      });

      expect(address).toBeDefined();
      expect(address.fullName).toBe('John Doe');
      expect(address.phone).toBe('081234567890');
      expect(address.city).toBe('Jakarta');
      expect(address.province).toBe('DKI Jakarta');
      expect(address.postalCode).toBe('12345');
      expect(address.isDefault).toBe(true);
    });

    it('should set default isDefault value', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          fullName: 'Jane Doe',
          phone: '081234567890',
          street: 'Jl. Test',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '54321',
        },
      });

      expect(address.isDefault).toBe(false);
    });

    it('should allow multiple addresses per user', async () => {
      await prisma.address.createMany({
        data: [
          {
            userId: testUser.id,
            fullName: 'John Doe',
            phone: '081234567890',
            street: 'Jl. Address 1',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345',
            isDefault: true,
          },
          {
            userId: testUser.id,
            fullName: 'John Doe',
            phone: '081234567890',
            street: 'Jl. Address 2',
            city: 'Bandung',
            province: 'Jawa Barat',
            postalCode: '54321',
            isDefault: false,
          },
        ],
      });

      const addresses = await prisma.address.findMany({
        where: { userId: testUser.id },
      });

      expect(addresses).toHaveLength(2);
    });

    it('should update isDefault status', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          fullName: 'John Doe',
          phone: '081234567890',
          street: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
          isDefault: false,
        },
      });

      const updatedAddress = await prisma.address.update({
        where: { id: address.id },
        data: { isDefault: true },
      });

      expect(updatedAddress.isDefault).toBe(true);
    });
  });

  describe('Relationships', () => {
    it('should relate to User', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          fullName: 'John Doe',
          phone: '081234567890',
          street: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
        include: {
          user: true,
        },
      });

      expect(address.user).toBeDefined();
      expect(address.user.id).toBe(testUser.id);
      expect(address.user.email).toBe('address-test@example.com');
    });

    it('should cascade delete when user is deleted', async () => {
      const address = await prisma.address.create({
        data: {
          userId: testUser.id,
          fullName: 'John Doe',
          phone: '081234567890',
          street: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
      });

      await prisma.user.delete({ where: { id: testUser.id } });

      const deletedAddress = await prisma.address.findUnique({
        where: { id: address.id },
      });

      expect(deletedAddress).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by userId (indexed)', async () => {
      await prisma.address.createMany({
        data: [
          {
            userId: testUser.id,
            fullName: 'John Doe',
            phone: '081234567890',
            street: 'Jl. Address 1',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345',
          },
          {
            userId: testUser.id,
            fullName: 'John Doe',
            phone: '081234567890',
            street: 'Jl. Address 2',
            city: 'Bandung',
            province: 'Jawa Barat',
            postalCode: '54321',
          },
        ],
      });

      const addresses = await prisma.address.findMany({
        where: { userId: testUser.id },
      });

      expect(addresses).toHaveLength(2);
    });
  });
});
