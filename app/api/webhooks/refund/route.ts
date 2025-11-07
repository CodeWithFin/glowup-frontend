import { NextResponse } from 'next/server';
import { markReturnRefunded } from '@/lib/return/return-service';
import { markEventProcessed } from '@/lib/order/store';

// POST /api/webhooks/refund - handle refund.succeeded from payment provider
export async function POST(req: Request) {
  try {
    // In production, verify webhook signature similar to Stripe webhook
    // For now, simplified: expect payload with event id and returnId
    const body = await req.json();
    const { eventId, returnId } = body;
    if (!eventId || !returnId) {
      return NextResponse.json({ error: 'Missing eventId or returnId' }, { status: 400 });
    }

    // Idempotency check
    const first = await markEventProcessed(`refund:${eventId}`);
    if (!first) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await markReturnRefunded(returnId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Webhook error' }, { status: 500 });
  }
}
