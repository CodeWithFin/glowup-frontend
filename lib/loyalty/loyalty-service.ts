import { kv } from '../redis';
import {
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyTransactionType,
  RedeemPointsInput,
  AccrualRules,
  DEFAULT_ACCRUAL_RULES,
} from '@/types/loyalty';

const ACCOUNT_PREFIX = 'loyalty:account:';
const TX_PREFIX = 'loyalty:tx:';
const USER_TX_INDEX_PREFIX = 'loyalty:user_txs:';
const ACCOUNT_TTL = 60 * 60 * 24 * 365 * 2; // 2 years
const TX_TTL = 60 * 60 * 24 * 365; // 1 year

/**
 * Get accrual rules from environment or use defaults
 */
export function getAccrualRules(): AccrualRules {
  return {
    pointsPerKES: parseFloat(process.env.LOYALTY_POINTS_PER_KES || String(DEFAULT_ACCRUAL_RULES.pointsPerKES)),
    reviewBonus: parseInt(process.env.LOYALTY_REVIEW_BONUS || String(DEFAULT_ACCRUAL_RULES.reviewBonus)),
    referralBonusReferrer: parseInt(process.env.LOYALTY_REFERRAL_BONUS_REFERRER || String(DEFAULT_ACCRUAL_RULES.referralBonusReferrer)),
    referralBonusReferee: parseInt(process.env.LOYALTY_REFERRAL_BONUS_REFEREE || String(DEFAULT_ACCRUAL_RULES.referralBonusReferee)),
    minimumRedeemPoints: parseInt(process.env.LOYALTY_MIN_REDEEM || String(DEFAULT_ACCRUAL_RULES.minimumRedeemPoints)),
    pointValueKES: parseFloat(process.env.LOYALTY_POINT_VALUE_KES || String(DEFAULT_ACCRUAL_RULES.pointValueKES)),
    expiryDays: process.env.LOYALTY_EXPIRY_DAYS ? parseInt(process.env.LOYALTY_EXPIRY_DAYS) : DEFAULT_ACCRUAL_RULES.expiryDays,
  };
}

/**
 * Calculate tier based on total earned points
 */
function calculateTier(totalEarned: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalEarned >= 10000) return 'platinum';
  if (totalEarned >= 5000) return 'gold';
  if (totalEarned >= 2000) return 'silver';
  return 'bronze';
}

/**
 * Get or create loyalty account
 */
export async function getOrCreateAccount(userId: string): Promise<LoyaltyAccount> {
  const key = `${ACCOUNT_PREFIX}${userId}`;
  const raw = await kv.get(key);

  if (raw) {
    try {
      return JSON.parse(raw) as LoyaltyAccount;
    } catch {
      // corrupted data, will recreate
    }
  }

  const now = Date.now();
  const account: LoyaltyAccount = {
    userId,
    balance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    tier: 'bronze',
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(key, JSON.stringify(account), ACCOUNT_TTL);
  return account;
}

/**
 * Get loyalty account balance
 */
export async function getBalance(userId: string): Promise<number> {
  const account = await getOrCreateAccount(userId);
  return account.balance;
}

/**
 * Credit points to user account
 */
export async function creditPoints(
  userId: string,
  points: number,
  type: LoyaltyTransactionType,
  description: string,
  metadata?: Record<string, any>
): Promise<LoyaltyTransaction> {
  if (points <= 0) {
    throw new Error('Points to credit must be positive');
  }

  const account = await getOrCreateAccount(userId);
  const rules = getAccrualRules();
  const now = Date.now();
  const expiresAt = rules.expiryDays ? now + rules.expiryDays * 24 * 60 * 60 * 1000 : undefined;

  // Update account
  const newBalance = account.balance + points;
  const newTotalEarned = account.totalEarned + points;
  const updatedAccount: LoyaltyAccount = {
    ...account,
    balance: newBalance,
    totalEarned: newTotalEarned,
    tier: calculateTier(newTotalEarned),
    updatedAt: now,
  };

  // Create transaction
  const txId = `${now}-${userId}-${type}`;
  const transaction: LoyaltyTransaction = {
    id: txId,
    userId,
    type,
    points,
    balance: newBalance,
    description,
    metadata,
    createdAt: now,
    expiresAt,
  };

  // Save account and transaction
  const accountKey = `${ACCOUNT_PREFIX}${userId}`;
  const txKey = `${TX_PREFIX}${txId}`;
  const userTxIndexKey = `${USER_TX_INDEX_PREFIX}${userId}`;

  await kv.set(accountKey, JSON.stringify(updatedAccount), ACCOUNT_TTL);
  await kv.set(txKey, JSON.stringify(transaction), TX_TTL);

  // Add transaction ID to user's transaction index
  const txIndexRaw = await kv.get(userTxIndexKey);
  const txIndex: string[] = txIndexRaw ? JSON.parse(txIndexRaw) : [];
  txIndex.unshift(txId); // prepend (most recent first)
  if (txIndex.length > 100) txIndex.pop(); // keep last 100
  await kv.set(userTxIndexKey, JSON.stringify(txIndex), TX_TTL);

  return transaction;
}

/**
 * Debit points from user account (redemption)
 */
export async function debitPoints(
  userId: string,
  points: number,
  description: string,
  metadata?: Record<string, any>
): Promise<LoyaltyTransaction> {
  if (points <= 0) {
    throw new Error('Points to debit must be positive');
  }

  const account = await getOrCreateAccount(userId);
  const rules = getAccrualRules();

  // Validate minimum redemption
  if (points < rules.minimumRedeemPoints) {
    throw new Error(`Minimum redemption is ${rules.minimumRedeemPoints} points`);
  }

  // Validate sufficient balance
  if (account.balance < points) {
    throw new Error(`Insufficient balance. Available: ${account.balance}, Requested: ${points}`);
  }

  const now = Date.now();
  const newBalance = account.balance - points;
  const newTotalRedeemed = account.totalRedeemed + points;

  // Update account
  const updatedAccount: LoyaltyAccount = {
    ...account,
    balance: newBalance,
    totalRedeemed: newTotalRedeemed,
    updatedAt: now,
  };

  // Create transaction (negative points)
  const txId = `${now}-${userId}-redemption`;
  const transaction: LoyaltyTransaction = {
    id: txId,
    userId,
    type: 'redemption',
    points: -points,
    balance: newBalance,
    description,
    metadata,
    createdAt: now,
  };

  // Save account and transaction
  const accountKey = `${ACCOUNT_PREFIX}${userId}`;
  const txKey = `${TX_PREFIX}${txId}`;
  const userTxIndexKey = `${USER_TX_INDEX_PREFIX}${userId}`;

  await kv.set(accountKey, JSON.stringify(updatedAccount), ACCOUNT_TTL);
  await kv.set(txKey, JSON.stringify(transaction), TX_TTL);

  // Add transaction to index
  const txIndexRaw = await kv.get(userTxIndexKey);
  const txIndex: string[] = txIndexRaw ? JSON.parse(txIndexRaw) : [];
  txIndex.unshift(txId);
  if (txIndex.length > 100) txIndex.pop();
  await kv.set(userTxIndexKey, JSON.stringify(txIndex), TX_TTL);

  return transaction;
}

/**
 * Calculate points earned from purchase amount
 */
export function calculatePointsFromPurchase(amountKES: number): number {
  const rules = getAccrualRules();
  return Math.floor(amountKES * rules.pointsPerKES);
}

/**
 * Calculate KES discount from points
 */
export function convertPointsToKES(points: number): number {
  const rules = getAccrualRules();
  return points * rules.pointValueKES;
}

/**
 * Get user's transaction history
 */
export async function getTransactions(userId: string, limit = 20): Promise<LoyaltyTransaction[]> {
  const userTxIndexKey = `${USER_TX_INDEX_PREFIX}${userId}`;
  const txIndexRaw = await kv.get(userTxIndexKey);
  const txIds: string[] = txIndexRaw ? JSON.parse(txIndexRaw) : [];

  const transactions: LoyaltyTransaction[] = [];
  for (const txId of txIds.slice(0, limit)) {
    const txKey = `${TX_PREFIX}${txId}`;
    const txRaw = await kv.get(txKey);
    if (txRaw) {
      try {
        const tx = JSON.parse(txRaw) as LoyaltyTransaction;
        transactions.push(tx);
      } catch {
        // skip corrupted transaction
      }
    }
  }

  return transactions;
}

/**
 * Validate redemption is possible
 */
export async function validateRedemption(userId: string, points: number): Promise<{ valid: boolean; error?: string; discountKES?: number }> {
  const rules = getAccrualRules();

  if (points < rules.minimumRedeemPoints) {
    return {
      valid: false,
      error: `Minimum redemption is ${rules.minimumRedeemPoints} points`,
    };
  }

  const account = await getOrCreateAccount(userId);
  if (account.balance < points) {
    return {
      valid: false,
      error: `Insufficient balance. Available: ${account.balance} points`,
    };
  }

  return {
    valid: true,
    discountKES: convertPointsToKES(points),
  };
}

/**
 * Get account details with tier info
 */
export async function getAccount(userId: string): Promise<LoyaltyAccount> {
  return getOrCreateAccount(userId);
}
