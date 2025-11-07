import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOrCreateAccount,
  creditPoints,
  debitPoints,
  getBalance,
  validateRedemption,
  calculatePointsFromPurchase,
  convertPointsToKES,
  getTransactions,
} from '../lib/loyalty/loyalty-service';

describe('Loyalty Service', () => {
  const testUserId = 'test-user-' + Date.now();

  beforeEach(() => {
    // Tests use in-memory Redis fallback
  });

  it('should create a new account with zero balance', async () => {
    const account = await getOrCreateAccount(testUserId);
    expect(account.userId).toBe(testUserId);
    expect(account.balance).toBe(0);
    expect(account.totalEarned).toBe(0);
    expect(account.totalRedeemed).toBe(0);
    expect(account.tier).toBe('bronze');
  });

  it('should credit points for a purchase', async () => {
    const userId = 'user-purchase-' + Date.now();
    const points = calculatePointsFromPurchase(10000); // 10,000 KES
    
    const transaction = await creditPoints(
      userId,
      points,
      'purchase',
      'Test purchase',
      { orderId: 'order-123' }
    );

    expect(transaction.points).toBe(points);
    expect(transaction.type).toBe('purchase');
    expect(transaction.balance).toBe(points);

    const balance = await getBalance(userId);
    expect(balance).toBe(points);
  });

  it('should calculate correct points from purchase amount', () => {
    // Default: 1 point per 100 KES (0.01 rate)
    expect(calculatePointsFromPurchase(10000)).toBe(100); // 10,000 KES = 100 points
    expect(calculatePointsFromPurchase(5000)).toBe(50);   // 5,000 KES = 50 points
    expect(calculatePointsFromPurchase(150)).toBe(1);     // 150 KES = 1 point (floor)
  });

  it('should convert points to KES discount correctly', () => {
    // Default: 1 point = 1 KES
    expect(convertPointsToKES(100)).toBe(100);
    expect(convertPointsToKES(500)).toBe(500);
  });

  it('should redeem points successfully', async () => {
    const userId = 'user-redeem-' + Date.now();
    
    // Credit 500 points
    await creditPoints(userId, 500, 'purchase', 'Initial credit');
    
    // Redeem 200 points
    const transaction = await debitPoints(
      userId,
      200,
      'Redemption test',
      { orderId: 'order-456' }
    );

    expect(transaction.points).toBe(-200); // negative for debit
    expect(transaction.type).toBe('redemption');
    expect(transaction.balance).toBe(300); // 500 - 200

    const balance = await getBalance(userId);
    expect(balance).toBe(300);
  });

  it('should reject redemption with insufficient balance', async () => {
    const userId = 'user-insufficient-' + Date.now();
    
    // Credit only 50 points
    await creditPoints(userId, 50, 'purchase', 'Small purchase');

    // Try to redeem 200 points
    await expect(
      debitPoints(userId, 200, 'Redemption test')
    ).rejects.toThrow('Insufficient balance');
  });

  it('should enforce minimum redemption amount', async () => {
    const userId = 'user-min-redeem-' + Date.now();
    
    // Credit 150 points
    await creditPoints(userId, 150, 'purchase', 'Purchase');

    // Try to redeem less than minimum (default 100)
    await expect(
      debitPoints(userId, 50, 'Below minimum')
    ).rejects.toThrow('Minimum redemption');
  });

  it('should validate redemption correctly', async () => {
    const userId = 'user-validate-' + Date.now();
    
    // Credit 300 points
    await creditPoints(userId, 300, 'purchase', 'Purchase');

    // Valid redemption
    const validResult = await validateRedemption(userId, 200);
    expect(validResult.valid).toBe(true);
    expect(validResult.discountKES).toBe(200);

    // Invalid: insufficient balance
    const insufficientResult = await validateRedemption(userId, 500);
    expect(insufficientResult.valid).toBe(false);
    expect(insufficientResult.error).toContain('Insufficient balance');

    // Invalid: below minimum
    const belowMinResult = await validateRedemption(userId, 50);
    expect(belowMinResult.valid).toBe(false);
    expect(belowMinResult.error).toContain('Minimum redemption');
  });

  it('should track transaction history', async () => {
    const userId = 'user-history-' + Date.now();
    
    // Make multiple transactions
    await creditPoints(userId, 100, 'purchase', 'Purchase 1');
    await creditPoints(userId, 50, 'review', 'Review bonus');
    await debitPoints(userId, 100, 'Redemption');

    const transactions = await getTransactions(userId, 10);
    
    expect(transactions.length).toBe(3);
    // Most recent first
    expect(transactions[0].type).toBe('redemption');
    expect(transactions[0].points).toBe(-100);
    expect(transactions[1].type).toBe('review');
    expect(transactions[2].type).toBe('purchase');
  });

  it('should update tier based on total earned', async () => {
    const userId = 'user-tier-' + Date.now();
    
    // Bronze: < 2000 points
    await creditPoints(userId, 1000, 'purchase', 'Purchase');
    let account = await getOrCreateAccount(userId);
    expect(account.tier).toBe('bronze');

    // Silver: >= 2000 points
    await creditPoints(userId, 1500, 'purchase', 'Purchase');
    account = await getOrCreateAccount(userId);
    expect(account.tier).toBe('silver');

    // Gold: >= 5000 points
    await creditPoints(userId, 2500, 'purchase', 'Purchase');
    account = await getOrCreateAccount(userId);
    expect(account.tier).toBe('gold');

    // Platinum: >= 10000 points
    await creditPoints(userId, 5000, 'purchase', 'Purchase');
    account = await getOrCreateAccount(userId);
    expect(account.tier).toBe('platinum');
  });

  it('should track totalEarned and totalRedeemed separately', async () => {
    const userId = 'user-totals-' + Date.now();
    
    await creditPoints(userId, 500, 'purchase', 'Purchase');
    await creditPoints(userId, 200, 'review', 'Review');
    await debitPoints(userId, 300, 'Redemption');

    const account = await getOrCreateAccount(userId);
    expect(account.totalEarned).toBe(700);   // 500 + 200
    expect(account.totalRedeemed).toBe(300); // 300 redeemed
    expect(account.balance).toBe(400);       // 700 - 300
  });
});
