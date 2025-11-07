import { NextResponse } from 'next/server';
import { verifyStripeSignature } from '@/lib/payment/stripe';
import { handleStripeEvent } from '@/lib/checkout/stripe-webhook';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    const rawBody = await req.text(); // raw body needed for signature verification
    const event = verifyStripeSignature(rawBody, signature);
    const result = await handleStripeEvent(event);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Webhook error' }, { status: 400 });
  }
}
