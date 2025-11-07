import type Stripe from 'stripe';
import { getDraft, saveOrder, markEventProcessed } from '@/lib/order/store';
import { clearCart } from '@/lib/cart/cart-service';
import { accrueLoyaltyPoints, decrementInventory, sendOrderConfirmationEmail } from '@/lib/order/post-order';
import type { Order } from '@/types/order';

export async function handleStripeEvent(event: Stripe.Event) {
  // Idempotency for webhook events
  const first = await markEventProcessed(event.id);
  if (!first) {
    return { ok: true, skipped: true };
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;
      const draftId = pi.metadata?.draftId;
      if (!draftId) return { ok: false, reason: 'No draftId' };
      const draft = await getDraft(draftId);
      if (!draft) return { ok: false, reason: 'Draft not found' };

      const order: Order = {
        id: draft.id,
        userId: draft.userId,
        sessionId: draft.sessionId,
        items: draft.items,
        currency: draft.currency,
        subtotal: draft.subtotal,
        tax: draft.tax,
        taxRate: draft.taxRate,
        shipping: draft.shipping,
        shippingMethod: draft.shippingMethod,
        total: draft.total,
        address: draft.address,
        status: 'paid',
        createdAt: draft.createdAt,
        paymentProvider: 'stripe',
        paymentIntentId: pi.id,
        events: [{ type: 'paid', at: Date.now(), data: { eventId: event.id } }],
      };
      await saveOrder(order);
      await clearCart({ userId: draft.userId, sessionId: draft.sessionId });
      await decrementInventory(order.id);
      await accrueLoyaltyPoints(order.userId, order.total);
      await sendOrderConfirmationEmail(order.address?.email, order.id);
      return { ok: true };
    }
    case 'payment_intent.payment_failed': {
      // Could mark draft as failed, omitted for brevity
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}
