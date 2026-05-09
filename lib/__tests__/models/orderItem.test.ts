import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';

describe('OrderItem Model', () => {
  let testOrder: { id: string };
  let testProduct: { id: string };
  let testVariant: { id: string };

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'orderitem-test@example.com',
        name: 'OrderItem Test User',
        password: 'password',
      },
    });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: 'Test User',
        phone: '081234567890',
        street: 'Jl. Test',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      },
    });

    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category-orderitem',
      },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-orderitem',
        description: 'Description',
        price: new Prisma.Decimal(150000),
        categoryId: category.id,
        variants: {
          create: {
            size: 'M',
            color: 'Red',
            sku: 'TEST-ORDERITEM-M-RED',
            stock: 10,
          },
        },
      },
      include: { variants: true },
    });

    testProduct = product;
    testVariant = product.variants[0];

    testOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-ITEM-001',
        userId: user.id,
        addressId: address.id,
        paymentMethod: 'bank_transfer',
        shippingMethod: 'JNE Regular',
        shippingCost: new Prisma.Decimal(15000),
        subtotal: new Prisma.Decimal(150000),
        total: new Prisma.Decimal(165000),
      },
    });
  });

  describe('Validations and Constraints', () => {
    it('should create an order item with valid data', async () => {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 2,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(300000),
        },
      });

      expect(orderItem).toBeDefined();
      expect(orderItem.orderId).toBe(testOrder.id);
      expect(orderItem.productId).toBe(testProduct.id);
      expect(orderItem.variantId).toBe(testVariant.id);
      expect(orderItem.quantity).toBe(2);
      expect(orderItem.price.toString()).toBe('150000');
      expect(orderItem.subtotal.toString()).toBe('300000');
    });

    it('should calculate subtotal correctly', async () => {
      const quantity = 3;
      const price = new Prisma.Decimal(150000);
      const subtotal = new Prisma.Decimal(quantity * 150000);

      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity,
          price,
          subtotal,
        },
      });

      expect(orderItem.subtotal.toString()).toBe('450000');
    });

    it('should allow multiple order items in one order', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Test Category 2',
          slug: 'test-category-orderitem-2',
        },
      });

      const product2 = await prisma.product.create({
        data: {
          name: 'Test Product 2',
          slug: 'test-product-orderitem-2',
          description: 'Description',
          price: new Prisma.Decimal(200000),
          categoryId: category.id,
          variants: {
            create: {
              size: 'L',
              color: 'Blue',
              sku: 'TEST-ORDERITEM-L-BLUE',
              stock: 5,
            },
          },
        },
        include: { variants: true },
      });

      await prisma.orderItem.createMany({
        data: [
          {
            orderId: testOrder.id,
            productId: testProduct.id,
            variantId: testVariant.id,
            quantity: 1,
            price: new Prisma.Decimal(150000),
            subtotal: new Prisma.Decimal(150000),
          },
          {
            orderId: testOrder.id,
            productId: product2.id,
            variantId: product2.variants[0].id,
            quantity: 2,
            price: new Prisma.Decimal(200000),
            subtotal: new Prisma.Decimal(400000),
          },
        ],
      });

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: testOrder.id },
      });

      expect(orderItems).toHaveLength(2);
    });
  });

  describe('Relationships', () => {
    it('should relate to Order', async () => {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 1,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(150000),
        },
        include: {
          order: true,
        },
      });

      expect(orderItem.order).toBeDefined();
      expect(orderItem.order.id).toBe(testOrder.id);
      expect(orderItem.order.orderNumber).toBe('ORD-ITEM-001');
    });

    it('should relate to Product', async () => {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 1,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(150000),
        },
        include: {
          product: true,
        },
      });

      expect(orderItem.product).toBeDefined();
      expect(orderItem.product.id).toBe(testProduct.id);
      expect(orderItem.product.name).toBe('Test Product');
    });

    it('should relate to ProductVariant', async () => {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 1,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(150000),
        },
        include: {
          variant: true,
        },
      });

      expect(orderItem.variant).toBeDefined();
      expect(orderItem.variant.id).toBe(testVariant.id);
      expect(orderItem.variant.sku).toBe('TEST-ORDERITEM-M-RED');
    });

    it('should cascade delete when order is deleted', async () => {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 1,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(150000),
        },
      });

      await prisma.order.delete({ where: { id: testOrder.id } });

      const deletedItem = await prisma.orderItem.findUnique({
        where: { id: orderItem.id },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by orderId (indexed)', async () => {
      await prisma.orderItem.create({
        data: {
          orderId: testOrder.id,
          productId: testProduct.id,
          variantId: testVariant.id,
          quantity: 1,
          price: new Prisma.Decimal(150000),
          subtotal: new Prisma.Decimal(150000),
        },
      });

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: testOrder.id },
      });

      expect(orderItems).toHaveLength(1);
    });
  });
});
