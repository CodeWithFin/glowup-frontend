import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe() {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  stripe = new Stripe(key);
  return stripe;
}

export async function createPaymentIntent(params: {
  amount: number; // KES
  currency: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}) {
  const s = getStripe();
  return s.paymentIntents.create(
    {
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: params.idempotencyKey }
  );
}

export function verifyStripeSignature(rawBody: string | Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  const s = getStripe();
  return s.webhooks.constructEvent(rawBody, signature, secret);
}
