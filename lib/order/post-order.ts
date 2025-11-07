import { creditPoints, calculatePointsFromPurchase } from '../loyalty/loyalty-service';

// Stubs for post-order side effects. In production, integrate with real systems.
export async function decrementInventory(_orderId: string) {
  // TODO: integrate with inventory service
}

export async function accrueLoyaltyPoints(userId: string | undefined, amountKES: number) {
  if (!userId) return; // skip for guest orders
  
  const points = calculatePointsFromPurchase(amountKES);
  if (points <= 0) return;

  try {
    await creditPoints(
      userId,
      points,
      'purchase',
      `Earned ${points} points from purchase`,
      { amountKES }
    );
  } catch (error) {
    console.error('Failed to accrue loyalty points:', error);
    // Don't throw - order is already complete, log and continue
  }
}

export async function sendOrderConfirmationEmail(_email: string | undefined, _orderId: string) {
  // TODO: integrate with email service
}

