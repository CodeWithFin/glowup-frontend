import { describe, it, expect } from 'vitest';
import { saveOrder, getUserOrders, getOrdersByStatus } from '@/lib/order/store';
import type { Order } from '@/types/order';

const mockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: `order-${Math.random().toString(36).slice(2)}`,
  userId: 'user1',
  items: [],
  currency: 'KES',
  subtotal: 1000,
  tax: 160,
  taxRate: 0.16,
  shipping: 350,
  shippingMethod: 'standard',
  total: 1510,
  status: 'paid',
  createdAt: Date.now(),
  paymentProvider: 'stripe',
  paymentIntentId: 'pi_test',
  events: [],
  ...overrides,
});

describe('order indexing and search', () => {
  it('indexes orders by userId', async () => {
    const order1 = mockOrder({ userId: 'userA' });
    const order2 = mockOrder({ userId: 'userA' });
    await saveOrder(order1);
    await saveOrder(order2);

    const orders = await getUserOrders('userA');
    expect(orders.length).toBeGreaterThanOrEqual(2);
    const ids = orders.map((o) => o.id);
    expect(ids).toContain(order1.id);
    expect(ids).toContain(order2.id);
  });

  it('indexes orders by status', async () => {
    const order = mockOrder({ status: 'shipped' });
    await saveOrder(order);

    const shipped = await getOrdersByStatus('shipped');
    expect(shipped.length).toBeGreaterThan(0);
    expect(shipped.some((o) => o.id === order.id)).toBe(true);
  });

  it('returns empty array for user with no orders', async () => {
    const orders = await getUserOrders('nonexistent-user');
    expect(orders).toEqual([]);
  });
});
