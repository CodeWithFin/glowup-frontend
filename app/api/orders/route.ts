import { NextResponse } from 'next/server';
import { getUserOrders } from '@/lib/order/store';
import { getUserIdFromToken } from '@/lib/admin';

// GET /api/orders - list user's orders
export async function GET() {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orders = await getUserOrders(userId);
    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
