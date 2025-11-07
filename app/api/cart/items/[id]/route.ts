import { NextResponse } from 'next/server';
import { updateItem, removeItem } from '@/lib/cart/cart-service';
import { getSessionId } from '@/lib/cart/session';
import { getAuthToken } from '@/lib/auth';
import type { UpdateCartItemInput } from '@/types/cart';

// PUT /api/cart/items/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const payload = (await req.json()) as Omit<UpdateCartItemInput, 'id'>;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const sessionId = getSessionId();
  const token = getAuthToken();
  const userId = token ? 'user-from-token' : undefined;
  const cart = await updateItem({ userId, sessionId: userId ? undefined : sessionId }, { id, ...payload });
  return NextResponse.json(cart);
}

// DELETE /api/cart/items/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const sessionId = getSessionId();
  const token = getAuthToken();
  const userId = token ? 'user-from-token' : undefined;
  const cart = await removeItem({ userId, sessionId: userId ? undefined : sessionId }, id);
  return NextResponse.json(cart);
}
