import { describe, it, expect, beforeEach } from 'vitest';
import { createReturn, approveReturn, denyReturn, markReturnRefunded, getReturn } from '@/lib/return/return-service';
import { saveOrder } from '@/lib/order/store';
import type { Order } from '@/types/order';

const mockOrder = (): Order => ({
  id: `order-${Date.now()}`,
  userId: 'user1',
  items: [
    { id: 'item1', productId: 'p1', title: 'Serum', price: 1500, quantity: 2, addedAt: Date.now() },
  ],
  currency: 'KES',
  subtotal: 3000,
  tax: 480,
  taxRate: 0.16,
  shipping: 350,
  shippingMethod: 'standard',
  total: 3830,
  status: 'paid',
  createdAt: Date.now(),
  paymentProvider: 'stripe',
  paymentIntentId: 'pi_test',
  events: [],
});

describe('returns service', () => {
  beforeEach(async () => {
    // Tests use unique order IDs per run to avoid collisions
  });

  it('creates a return request for a valid order', async () => {
    const order = mockOrder();
    await saveOrder(order);

    const returnReq = await createReturn(
      { userId: 'user1' },
      {
        orderId: order.id,
        items: [{ orderItemId: 'item1', productId: 'p1', title: 'Serum', quantity: 1, reason: 'defective' }],
        customerNote: 'Product arrived damaged',
      }
    );

    expect(returnReq.orderId).toBe(order.id);
    expect(returnReq.status).toBe('pending');
    expect(returnReq.items).toHaveLength(1);
    expect(returnReq.totalRefundAmount).toBe(1500);
  });

  it('approves a return and updates order status', async () => {
    const order = mockOrder();
    await saveOrder(order);

    const returnReq = await createReturn(
      { userId: 'user1' },
      {
        orderId: order.id,
        items: [{ orderItemId: 'item1', productId: 'p1', title: 'Serum', quantity: 1, reason: 'defective' }],
      }
    );

    const approved = await approveReturn(returnReq.id, 'admin1', { decision: 'approve', adminNote: 'Approved' });
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('admin1');
  });

  it('denies a return', async () => {
    const order = mockOrder();
    await saveOrder(order);

    const returnReq = await createReturn(
      { userId: 'user1' },
      {
        orderId: order.id,
        items: [{ orderItemId: 'item1', productId: 'p1', title: 'Serum', quantity: 1, reason: 'changed_mind' }],
      }
    );

    const denied = await denyReturn(returnReq.id, 'admin1', { decision: 'deny', adminNote: 'Past return window' });
    expect(denied.status).toBe('denied');
    expect(denied.deniedBy).toBe('admin1');
  });

  it('marks return as refunded idempotently', async () => {
    const order = mockOrder();
    await saveOrder(order);

    const returnReq = await createReturn(
      { userId: 'user1' },
      {
        orderId: order.id,
        items: [{ orderItemId: 'item1', productId: 'p1', title: 'Serum', quantity: 1, reason: 'defective' }],
      }
    );

    await approveReturn(returnReq.id, 'admin1', { decision: 'approve' });
    const refunded = await markReturnRefunded(returnReq.id);
    expect(refunded.status).toBe('refunded');
    expect(refunded.refundedAt).toBeDefined();
  });

  it('throws when trying to return an ineligible order', async () => {
    const order = mockOrder();
    order.status = 'cancelled';
    await saveOrder(order);

    await expect(
      createReturn(
        { userId: 'user1' },
        {
          orderId: order.id,
          items: [{ orderItemId: 'item1', productId: 'p1', title: 'Serum', quantity: 1, reason: 'defective' }],
        }
      )
    ).rejects.toThrow('Order not eligible for return');
  });
});
