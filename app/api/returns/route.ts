import { NextResponse } from 'next/server';
import { createReturn } from '@/lib/return/return-service';
import { getUserIdFromToken } from '@/lib/admin';
import { getSessionId } from '@/lib/cart/session';
import type { CreateReturnInput } from '@/types/return';

// POST /api/returns - create return request
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateReturnInput;
    if (!body.orderId || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const userId = getUserIdFromToken();
    const sessionId = userId ? undefined : getSessionId();
    const returnReq = await createReturn({ userId, sessionId }, body);
    return NextResponse.json(returnReq, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create return' }, { status: 500 });
  }
}
