import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Prisma, PaymentStatus } from '@/lib/generated/prisma';

describe('Payment Model', () => {
  let testOrder: { id: string };

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'payment-test@example.com',
        name: 'Payment Test User',
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

    testOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-PAYMENT-001',
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
    it('should create a payment with valid data', async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-001',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
          paymentUrl: 'https://payment.example.com/pay/123',
        },
      });

      expect(payment).toBeDefined();
      expect(payment.orderId).toBe(testOrder.id);
      expect(payment.transactionId).toBe('TXN-2024-001');
      expect(payment.amount.toString()).toBe('165000');
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.paymentMethod).toBe('bank_transfer');
      expect(payment.createdAt).toBeInstanceOf(Date);
    });

    it('should enforce unique orderId constraint (one-to-one)', async () => {
      await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-002',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      await expect(
        prisma.payment.create({
          data: {
            orderId: testOrder.id, // duplicate orderId
            transactionId: 'TXN-2024-003',
            amount: new Prisma.Decimal(165000),
            status: PaymentStatus.PENDING,
            paymentMethod: 'bank_transfer',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique transactionId constraint', async () => {
      await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-UNIQUE-001',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: 'payment-test-2@example.com',
          name: 'Payment Test User 2',
          password: 'password',
        },
      });

      const address2 = await prisma.address.create({
        data: {
          userId: user2.id,
          fullName: 'Test User 2',
          phone: '081234567890',
          street: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
        },
      });

      const order2 = await prisma.order.create({
        data: {
          orderNumber: 'ORD-PAYMENT-002',
          userId: user2.id,
          addressId: address2.id,
          paymentMethod: 'bank_transfer',
          shippingMethod: 'JNE Regular',
          shippingCost: new Prisma.Decimal(15000),
          subtotal: new Prisma.Decimal(150000),
          total: new Prisma.Decimal(165000),
        },
      });

      await expect(
        prisma.payment.create({
          data: {
            orderId: order2.id,
            transactionId: 'TXN-UNIQUE-001', // duplicate transactionId
            amount: new Prisma.Decimal(165000),
            status: PaymentStatus.PENDING,
            paymentMethod: 'bank_transfer',
          },
        })
      ).rejects.toThrow();
    });

    it('should update payment status', async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-004',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      expect(updatedPayment.status).toBe(PaymentStatus.PAID);
      expect(updatedPayment.paidAt).toBeInstanceOf(Date);
    });

    it('should handle optional fields', async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-005',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      expect(payment.paymentUrl).toBeNull();
      expect(payment.paidAt).toBeNull();
    });

    it('should support different payment statuses', async () => {
      const statuses = [
        PaymentStatus.PENDING,
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.REFUNDED,
      ];

      for (let i = 0; i < statuses.length; i++) {
        const user = await prisma.user.create({
          data: {
            email: `payment-status-${i}@example.com`,
            name: `User ${i}`,
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

        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-STATUS-${i}`,
            userId: user.id,
            addressId: address.id,
            paymentMethod: 'bank_transfer',
            shippingMethod: 'JNE Regular',
            shippingCost: new Prisma.Decimal(15000),
            subtotal: new Prisma.Decimal(150000),
            total: new Prisma.Decimal(165000),
          },
        });

        const payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            transactionId: `TXN-STATUS-${i}`,
            amount: new Prisma.Decimal(165000),
            status: statuses[i],
            paymentMethod: 'bank_transfer',
          },
        });

        expect(payment.status).toBe(statuses[i]);
      }
    });
  });

  describe('Relationships', () => {
    it('should relate to Order (one-to-one)', async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-006',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
        include: {
          order: true,
        },
      });

      expect(payment.order).toBeDefined();
      expect(payment.order.id).toBe(testOrder.id);
      expect(payment.order.orderNumber).toBe('ORD-PAYMENT-001');
    });

    it('should cascade delete when order is deleted', async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-2024-007',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      await prisma.order.delete({ where: { id: testOrder.id } });

      const deletedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });

      expect(deletedPayment).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should efficiently query by transactionId (indexed)', async () => {
      await prisma.payment.create({
        data: {
          orderId: testOrder.id,
          transactionId: 'TXN-INDEXED-001',
          amount: new Prisma.Decimal(165000),
          status: PaymentStatus.PENDING,
          paymentMethod: 'bank_transfer',
        },
      });

      const payment = await prisma.payment.findUnique({
        where: { transactionId: 'TXN-INDEXED-001' },
      });

      expect(payment).toBeDefined();
      expect(payment?.transactionId).toBe('TXN-INDEXED-001');
    });
  });
});
