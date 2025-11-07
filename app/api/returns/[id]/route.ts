import { NextResponse } from 'next/server';
import { getReturn, approveReturn, denyReturn } from '@/lib/return/return-service';
import { getUserIdFromToken, requireAdmin } from '@/lib/admin';
import type { ReturnDecisionInput } from '@/types/return';

// GET /api/returns/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const returnReq = await getReturn(id);
    if (!returnReq) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    const userId = getUserIdFromToken();
    // Users can see their own returns; admins can see all
    if (returnReq.userId !== userId) {
      requireAdmin(userId);
    }

    return NextResponse.json(returnReq);
  } catch (e: any) {
    if (e.message.includes('Forbidden')) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: e.message || 'Failed to fetch return' }, { status: 500 });
  }
}

// PUT /api/returns/[id]/decision - admin only
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const userId = getUserIdFromToken();
    requireAdmin(userId);

    const body = (await req.json()) as ReturnDecisionInput;
    if (!body.decision || !['approve', 'deny'].includes(body.decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const returnReq =
      body.decision === 'approve'
        ? await approveReturn(id, userId!, body)
        : await denyReturn(id, userId!, body);

    return NextResponse.json(returnReq);
  } catch (e: any) {
    if (e.message.includes('Forbidden')) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: e.message || 'Failed to process decision' }, { status: 500 });
  }
}
