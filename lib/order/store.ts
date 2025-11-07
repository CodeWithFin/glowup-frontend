import { kv } from '@/lib/redis';
import type { OrderDraft, Order } from '@/types/order';

const DRAFT_TTL = 60 * 60; // 1 hour

export async function saveDraft(draft: OrderDraft): Promise<void> {
  await kv.set(`order:draft:${draft.id}`, JSON.stringify(draft), DRAFT_TTL);
}

export async function getDraft(id: string): Promise<OrderDraft | null> {
  const raw = await kv.get(`order:draft:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrderDraft;
  } catch {
    return null;
  }
}

export async function saveOrder(order: Order): Promise<void> {
  await kv.set(`order:${order.id}`, JSON.stringify(order));
  // Index by userId for search
  if (order.userId) {
    await indexOrderForUser(order.userId, order.id);
  }
  // Index by status for admin queries
  await indexOrderByStatus(order.status, order.id);
}

export async function getOrder(id: string): Promise<Order | null> {
  const raw = await kv.get(`order:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

async function indexOrderForUser(userId: string, orderId: string): Promise<void> {
  const key = `orders:user:${userId}`;
  const existing = await kv.get(key);
  const ids = existing ? JSON.parse(existing) : [];
  if (!ids.includes(orderId)) {
    ids.unshift(orderId); // newest first
    await kv.set(key, JSON.stringify(ids));
  }
}

async function indexOrderByStatus(status: string, orderId: string): Promise<void> {
  const key = `orders:status:${status}`;
  const existing = await kv.get(key);
  const ids = existing ? JSON.parse(existing) : [];
  if (!ids.includes(orderId)) {
    ids.unshift(orderId);
    await kv.set(key, JSON.stringify(ids));
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const key = `orders:user:${userId}`;
  const raw = await kv.get(key);
  if (!raw) return [];
  const ids = JSON.parse(raw) as string[];
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is Order => o !== null);
}

export async function getOrdersByStatus(status: string): Promise<Order[]> {
  const key = `orders:status:${status}`;
  const raw = await kv.get(key);
  if (!raw) return [];
  const ids = JSON.parse(raw) as string[];
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is Order => o !== null);
}

export async function markEventProcessed(eventId: string): Promise<boolean> {
  const key = `stripe:event:${eventId}:processed`;
  const already = await kv.get(key);
  if (already) return false;
  await kv.set(key, '1');
  return true;
}
