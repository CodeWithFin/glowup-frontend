import { kv } from '@/lib/redis';
import type { ReturnRequest, CreateReturnInput, ReturnDecisionInput } from '@/types/return';
import type { Order } from '@/types/order';
import { getOrder, saveOrder } from '@/lib/order/store';
import { randomUUID } from 'crypto';

const RETURN_TTL = 60 * 60 * 24 * 90; // 90 days retention

export async function saveReturn(returnReq: ReturnRequest): Promise<void> {
  await kv.set(`return:${returnReq.id}`, JSON.stringify(returnReq), RETURN_TTL);
  // Index by order for quick lookup
  await kv.set(`return:order:${returnReq.orderId}`, returnReq.id, RETURN_TTL);
}

export async function getReturn(id: string): Promise<ReturnRequest | null> {
  const raw = await kv.get(`return:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReturnRequest;
  } catch {
    return null;
  }
}

export async function getReturnByOrderId(orderId: string): Promise<ReturnRequest | null> {
  const returnId = await kv.get(`return:order:${orderId}`);
  if (!returnId) return null;
  return getReturn(returnId);
}

export async function createReturn(
  identity: { userId?: string; sessionId?: string },
  input: CreateReturnInput
): Promise<ReturnRequest> {
  const order = await getOrder(input.orderId);
  if (!order) throw new Error('Order not found');
  
  // Verify ownership
  if (identity.userId && order.userId !== identity.userId) {
    throw new Error('Order does not belong to user');
  }
  if (!identity.userId && order.sessionId !== identity.sessionId) {
    throw new Error('Order does not belong to session');
  }

  // Check if order is eligible for return (paid, delivered, etc.)
  if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
    throw new Error('Order not eligible for return');
  }

  // Check if return already exists
  const existing = await getReturnByOrderId(input.orderId);
  if (existing) throw new Error('Return already exists for this order');

  // Calculate refund amount (simplified: sum of returned items)
  let totalRefundAmount = 0;
  for (const item of input.items) {
    const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
    if (!orderItem) throw new Error(`Order item ${item.orderItemId} not found`);
    if (item.quantity > orderItem.quantity) {
      throw new Error(`Return quantity exceeds order quantity for ${item.orderItemId}`);
    }
    totalRefundAmount += orderItem.price * item.quantity;
  }

  const returnReq: ReturnRequest = {
    id: randomUUID(),
    orderId: input.orderId,
    userId: identity.userId,
    sessionId: identity.sessionId,
    items: input.items.map((i) => ({
      orderItemId: i.orderItemId,
      productId: i.productId,
      title: i.title,
      quantity: i.quantity,
      reason: i.reason,
      photos: i.photos,
    })),
    totalRefundAmount,
    status: 'pending',
    customerNote: input.customerNote,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    events: [{ type: 'created', at: Date.now() }],
  };

  await saveReturn(returnReq);

  // Update order status
  order.status = 'return_requested';
  order.events.push({ type: 'return_requested', at: Date.now(), data: { returnId: returnReq.id } });
  await saveOrder(order);

  return returnReq;
}

export async function approveReturn(
  returnId: string,
  adminUserId: string,
  input: ReturnDecisionInput
): Promise<ReturnRequest> {
  const returnReq = await getReturn(returnId);
  if (!returnReq) throw new Error('Return not found');
  if (returnReq.status !== 'pending') throw new Error('Return not pending');

  returnReq.status = 'approved';
  returnReq.approvedBy = adminUserId;
  returnReq.adminNote = input.adminNote;
  returnReq.updatedAt = Date.now();
  returnReq.events.push({ type: 'approved', at: Date.now(), by: adminUserId, note: input.adminNote });
  await saveReturn(returnReq);

  // Update order
  const order = await getOrder(returnReq.orderId);
  if (order) {
    order.status = 'return_approved';
    order.events.push({ type: 'return_approved', at: Date.now(), data: { returnId } });
    await saveOrder(order);
  }

  return returnReq;
}

export async function denyReturn(
  returnId: string,
  adminUserId: string,
  input: ReturnDecisionInput
): Promise<ReturnRequest> {
  const returnReq = await getReturn(returnId);
  if (!returnReq) throw new Error('Return not found');
  if (returnReq.status !== 'pending') throw new Error('Return not pending');

  returnReq.status = 'denied';
  returnReq.deniedBy = adminUserId;
  returnReq.adminNote = input.adminNote;
  returnReq.updatedAt = Date.now();
  returnReq.events.push({ type: 'denied', at: Date.now(), by: adminUserId, note: input.adminNote });
  await saveReturn(returnReq);

  // Update order back to previous state (simplified: back to paid/delivered)
  const order = await getOrder(returnReq.orderId);
  if (order) {
    order.status = 'return_denied';
    order.events.push({ type: 'return_denied', at: Date.now(), data: { returnId } });
    await saveOrder(order);
  }

  return returnReq;
}

export async function markReturnRefunded(returnId: string): Promise<ReturnRequest> {
  const returnReq = await getReturn(returnId);
  if (!returnReq) throw new Error('Return not found');
  if (returnReq.status !== 'approved') throw new Error('Return not approved');

  returnReq.status = 'refunded';
  returnReq.refundedAt = Date.now();
  returnReq.updatedAt = Date.now();
  returnReq.events.push({ type: 'refunded', at: Date.now() });
  await saveReturn(returnReq);

  // Update order
  const order = await getOrder(returnReq.orderId);
  if (order) {
    order.status = 'refunded';
    order.refundedAmount = returnReq.totalRefundAmount;
    order.events.push({ type: 'refunded', at: Date.now(), data: { returnId, amount: returnReq.totalRefundAmount } });
    await saveOrder(order);
  }

  return returnReq;
}
