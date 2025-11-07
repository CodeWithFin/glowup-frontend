import { describe, it, expect } from 'vitest';
import { handleStripeEvent } from '@/lib/checkout/stripe-webhook';

// Minimal mock of Stripe.PaymentIntent succeeded event
const mockEvent = (overrides: any = {}) => ({
  id: `evt_${Math.random().toString(36).slice(2)}`,
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: `pi_${Math.random().toString(36).slice(2)}`,
      metadata: { draftId: overrides.draftId || 'nonexistent' },
    },
  },
} as any);

it('skips when draft not found', async () => {
  const res = await handleStripeEvent(mockEvent({ draftId: 'missing' }));
  expect(res.ok).toBe(false);
});

describe('webhook idempotency', () => {
  it('marks first event processed, second skipped', async () => {
    const evt = mockEvent({ draftId: 'missing' });
    const first = await handleStripeEvent(evt);
    const second = await handleStripeEvent(evt);
    expect(first.ok).toBe(false); // because draft missing
    expect(second.skipped).toBe(true);
  });
});
