export type LoyaltyTransactionType = 
  | 'purchase' 
  | 'review' 
  | 'referral' 
  | 'bonus' 
  | 'redemption' 
  | 'expiry' 
  | 'adjustment';

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number; // positive for earn, negative for spend/expiry
  balance: number; // balance after transaction
  description: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    referralCode?: string;
    [key: string]: any;
  };
  createdAt: number;
  expiresAt?: number; // for earned points with expiry
}

export interface LoyaltyAccount {
  userId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: number;
  updatedAt: number;
}

export interface RedeemPointsInput {
  points: number; // points to redeem
  orderId?: string; // optional: associate with order
}

export interface AccrualRules {
  pointsPerKES: number; // e.g., 1 point per 100 KES
  reviewBonus: number; // points for writing a review
  referralBonusReferrer: number; // points for referrer
  referralBonusReferee: number; // points for referee
  minimumRedeemPoints: number; // min points to redeem
  pointValueKES: number; // KES value per point (e.g., 1 point = 1 KES)
  expiryDays?: number; // points expire after X days (optional)
}

// Default accrual rules
export const DEFAULT_ACCRUAL_RULES: AccrualRules = {
  pointsPerKES: 0.01, // 1 point per 100 KES spent
  reviewBonus: 50,
  referralBonusReferrer: 500,
  referralBonusReferee: 250,
  minimumRedeemPoints: 100,
  pointValueKES: 1, // 1 point = 1 KES discount
  expiryDays: 365, // points expire after 1 year
};
