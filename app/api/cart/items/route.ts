import { NextResponse } from 'next/server';
import { addItem } from '@/lib/cart/cart-service';
import { getSessionId } from '@/lib/cart/session';
import { getAuthToken } from '@/lib/auth';
import type { AddCartItemInput } from '@/types/cart';

// POST /api/cart/items
export async function POST(req: Request) {
  const body = (await req.json()) as AddCartItemInput;
  if (!body?.productId || !body?.title || typeof body?.price !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const sessionId = getSessionId();
  const token = getAuthToken();
  const userId = token ? 'user-from-token' : undefined; // placeholder mapping
  const cart = await addItem({ userId, sessionId: userId ? undefined : sessionId }, body);
  return NextResponse.json(cart, { status: 201 });
}
