import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma, OrderStatus, PaymentStatus } from '@/lib/generated/prisma';

describe('Order Model', () => {
  let testUser: { id: string };
  let testAddress: { id: string };
  let testProduct: { id: string };
  let testVariant: { id: string };

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'order-test@example.com',
        name: 'Order Test User',
        password: 'password',
      },
    });

    // Create test address
    testAddress = await prisma.address.create({
      data: {
        userId: testUser.id,
        fullName: 'Test User',
        phone: '081234567890',
        street: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
    });

    // Create test product and variant
    const category = await prisma.category.create({
      data: { name: 'Test Category', slug: 'test-category-order', order: 0 },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-order',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
        variants: {
          create: {
            size: 'M',
            color: 'Red',
            sku: 'TEST-ORDER-M-RED',
            stock: 10,
          },
        },
      },
      include: { variants: true },
    });

    testProduct = product;
    testVariant = product.variants[0];
  });

  describe('Validations and Constraints', () => {
    it('should create an order with valid data', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-001',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      expect(order).toBeDefined();
      expect(order.orderNumber).toBe('ORD-2024-001');
      expect(order.status).toBe(OrderStatus.PENDING); // default value
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING); // default value
      expect(order.total.toString()).toBe('165000');
    });

    it('should enforce unique orderNumber constraint', async () => {
      await prisma.order.create({
        data: {
          orderNumber: 'ORD-UNIQUE-001',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      await expect(
        prisma.order.create({
          data: {
            orderNumber: 'ORD-UNIQUE-001', // duplicate
            userId: testUser.id,
            addressId: testAddress.id,
            paymentMethod: 'bank_transfer',
            shippingMethod: 'JNE Regular',
            shippingCost: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(150000),
            total: new Prisma.Decimal(165000),
          },
        })
      ).rejects.toThrow();
    });

    it('should set default status values correctly', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-002',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
    });

    it('should update order status', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-003',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      expect(updatedOrder.status).toBe(OrderStatus.PROCESSING);
      expect(updatedOrder.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should handle optional fields', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-004',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      expect(order.trackingNumber).toBeNull();
      expect(order.courierName).toBeNull();
      expect(order.notes).toBeNull();
    });

    it('should add tracking information', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-005',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingNumber: 'JNE123456789',
          courierName: 'JNE',
          status: OrderStatus.SHIPPED,
        },
      });

      expect(updatedOrder.trackingNumber).toBe('JNE123456789');
      expect(updatedOrder.courierName).toBe('JNE');
      expect(updatedOrder.status).toBe(OrderStatus.SHIPPED);
    });
  });

  describe('Relationships', () => {
    it('should relate to User', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-006',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
        include: {
          user: true,
        },
      });

      expect(order.user).toBeDefined();
      expect(order.user.id).toBe(testUser.id);
      expect(order.user.email).toBe('order-test@example.com');
    });

    it('should relate to Address', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-007',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
        include: {
          shippingAddress: true,
        },
      });

      expect(order.shippingAddress).toBeDefined();
      expect(order.shippingAddress.id).toBe(testAddress.id);
      expect(order.shippingAddress.city).toBe('Jakarta');
    });

    it('should have OrderItem relationship (one-to-many)', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-008',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
          items: {
            create: [
              {
                productId: testProduct.id,
                variantId: testVariant.id,
                quantity: 1,
                price: new Prisma.Decimal(150000),
                subtotal: new Prisma.Decimal(150000),
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(1);
      expect(order.items[0].price.toString()).toBe('150000');
    });

    it('should have Payment relationship (one-to-one)', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-009',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
          payment: {
            create: {
              transactionId: 'TXN-2024-001',
              amount: new Prisma.Decimal(165000),
              status: PaymentStatus.PENDING,
              paymentMethod: 'bank_transfer',
            },
          },
        },
        include: {
          payment: true,
        },
      });

      expect(order.payment).toBeDefined();
      expect(order.payment?.transactionId).toBe('TXN-2024-001');
      expect(order.payment?.amount.toString()).toBe('165000');
    });

    it('should cascade delete OrderItems when order is deleted', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-010',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
          items: {
            create: [
              {
                productId: testProduct.id,
                variantId: testVariant.id,
                quantity: 1,
                price: new Prisma.Decimal(150000),
                subtotal: new Prisma.Decimal(150000),
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      const itemId = order.items[0].id;

      await prisma.order.delete({ where: { id: order.id } });

      const deletedItem = await prisma.orderItem.findUnique({
        where: { id: itemId },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by orderNumber (indexed)', async () => {
      await prisma.order.create({
        data: {
          orderNumber: 'ORD-INDEXED-001',
          userId: testUser.id,
          addressId: testAddress.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      const order = await prisma.order.findUnique({
        where: { orderNumber: 'ORD-INDEXED-001' },
      });

      expect(order).toBeDefined();
      expect(order?.orderNumber).toBe('ORD-INDEXED-001');
    });

    it('should efficiently query by userId (indexed)', async () => {
      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'ORD-USER-001',
            userId: testUser.id,
            addressId: testAddress.id,
            paymentMethod: 'bank_transfer',
            shippingMethod: 'JNE Regular',
            shippingCost: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(150000),
            total: new Prisma.Decimal(165000),
          },
          {
            orderNumber: 'ORD-USER-002',
            userId: testUser.id,
            addressId: testAddress.id,
            paymentMethod: 'credit_card',
            shippingMethod: 'JNE Express',
            shippingCost: new Prisma.Decimal(25000),
            subtotal: new Prisma.Decimal(200000),
            total: new Prisma.Decimal(225000),
          },
        ],
      });

      const orders = await prisma.order.findMany({
        where: { userId: testUser.id },
      });

      expect(orders).toHaveLength(2);
    });

    it('should efficiently query by status (indexed)', async () => {
      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'ORD-STATUS-001',
            userId: testUser.id,
            addressId: testAddress.id,
            status: OrderStatus.PENDING,
            paymentMethod: 'bank_transfer',
            shippingMethod: 'JNE Regular',
            shippingCost: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(150000),
            total: new Prisma.Decimal(165000),
          },
          {
            orderNumber: 'ORD-STATUS-002',
            userId: testUser.id,
            addressId: testAddress.id,
            status: OrderStatus.SHIPPED,
            paymentMethod: 'bank_transfer',
            shippingMethod: 'JNE Regular',
            shippingCost: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(150000),
            total: new Prisma.Decimal(165000),
          },
        ],
      });

      const pendingOrders = await prisma.order.findMany({
        where: { status: OrderStatus.PENDING },
      });

      expect(pendingOrders.length).toBeGreaterThanOrEqual(1);
    });
  });
});
