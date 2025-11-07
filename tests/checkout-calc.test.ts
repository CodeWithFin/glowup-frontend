import { describe, it, expect } from 'vitest';
import { computeTotals } from '@/lib/order/calc';

describe('checkout totals', () => {
  it('computes totals with VAT and shipping', () => {
    const items = [
      { id: 'i1', productId: 'p1', title: 'Serum', price: 1500, quantity: 2, addedAt: Date.now() },
    ];
    const res = computeTotals({ items, shippingMethod: 'standard' });
    expect(res.subtotal).toBe(3000);
    expect(res.tax).toBe(480); // 16%
    expect(res.shipping).toBeGreaterThan(0);
    expect(res.total).toBe(res.subtotal + res.tax + res.shipping);
  });
});
