import { NextResponse } from 'next/server';
import { getOrder, saveOrder } from '@/lib/order/store';
import { getUserIdFromToken, requireAdmin } from '@/lib/admin';
import type { OrderStatus } from '@/types/order';

// GET /api/orders/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const userId = getUserIdFromToken();
    // Users can only see their own orders; admins can see all
    if (order.userId !== userId) {
      requireAdmin(userId); // will throw if not admin
    }

    return NextResponse.json(order);
  } catch (e: any) {
    if (e.message.includes('Forbidden')) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: e.message || 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id]/status - admin only
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const userId = getUserIdFromToken();
    requireAdmin(userId);

    const body = await req.json();
    const { status, trackingNumber } = body as { status?: OrderStatus; trackingNumber?: string };
    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.events.push({ type: 'status_updated', at: Date.now(), data: { status, by: userId } });
    await saveOrder(order);

    return NextResponse.json(order);
  } catch (e: any) {
    if (e.message.includes('Forbidden')) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: e.message || 'Failed to update order' }, { status: 500 });
  }
}
