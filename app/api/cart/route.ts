import { NextResponse } from 'next/server';
import { getCart } from '@/lib/cart/cart-service';
import { getSessionId } from '@/lib/cart/session';
import { getAuthToken } from '@/lib/auth';

// GET /api/cart
export async function GET() {
  const sessionId = getSessionId();
  // For now userId derived from token presence (mock). Extend with real auth lookup.
  const token = getAuthToken();
  const userId = token ? 'user-from-token' : undefined; // placeholder mapping
  const cart = await getCart({ userId, sessionId: userId ? undefined : sessionId });
  return NextResponse.json(cart);
}
