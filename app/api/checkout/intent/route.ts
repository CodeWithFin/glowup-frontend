import { NextResponse } from 'next/server';
import { getCart } from '@/lib/cart/cart-service';
import { getSessionId } from '@/lib/cart/session';
import { getAuthToken } from '@/lib/auth';
import { computeTotals } from '@/lib/order/calc';
import { createPaymentIntent } from '@/lib/payment/stripe';
import { saveDraft } from '@/lib/order/store';
import { validateRedemption, debitPoints } from '@/lib/loyalty/loyalty-service';
import type { ShippingMethod, OrderDraft } from '@/types/order';
import { randomUUID } from 'crypto';

interface Body {
  shippingMethod?: ShippingMethod;
  address?: any; // simplified
  pointsToRedeem?: number; // optional: redeem loyalty points
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const shippingMethod = body.shippingMethod || 'standard';
    const pointsToRedeem = body.pointsToRedeem;
    const sessionId = getSessionId();
    const token = getAuthToken();
    const userId = token ? 'user-from-token' : undefined;
    const cart = await getCart({ userId, sessionId: userId ? undefined : sessionId });
    if (cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart empty' }, { status: 400 });
    }

    // Validate points redemption if requested
    if (pointsToRedeem && pointsToRedeem > 0) {
      if (!userId) {
        return NextResponse.json({ error: 'Must be logged in to redeem points' }, { status: 401 });
      }
      
      const validation = await validateRedemption(userId, pointsToRedeem);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const totals = computeTotals({ items: cart.items, shippingMethod, pointsToRedeem });
    const draftId = randomUUID();

    // If using points, debit them now (before payment)
    if (pointsToRedeem && pointsToRedeem > 0 && userId) {
      await debitPoints(
        userId,
        pointsToRedeem,
        `Redeemed ${pointsToRedeem} points for order ${draftId}`,
        { orderId: draftId }
      );
    }

    // Create payment intent (amount in smallest currency unit; KES has 2 decimals but we store as integer already)
    const intent = await createPaymentIntent({
      amount: totals.total,
      currency: 'kes',
      metadata: {
        draftId,
        userId: userId || '',
      },
      idempotencyKey: `checkout:${draftId}`,
    });

    const draft: OrderDraft = {
      id: draftId,
      userId,
      sessionId: userId ? undefined : sessionId,
      items: cart.items,
      currency: 'KES',
      subtotal: totals.subtotal,
      tax: totals.tax,
      taxRate: totals.taxRate,
      shipping: totals.shipping,
      shippingMethod,
      pointsDiscount: totals.pointsDiscount,
      pointsRedeemed: totals.pointsRedeemed,
      total: totals.total,
      address: body.address,
      status: 'pending_payment',
      createdAt: Date.now(),
      paymentProvider: 'stripe',
    };
    await saveDraft(draft);

    return NextResponse.json({
      draftId: draft.id,
      clientSecret: intent.client_secret,
      amount: draft.total,
      currency: draft.currency,
      pointsDiscount: totals.pointsDiscount,
      pointsRedeemed: totals.pointsRedeemed,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Checkout failed' }, { status: 500 });
  }
}
