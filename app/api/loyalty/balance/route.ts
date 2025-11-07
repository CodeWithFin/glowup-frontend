import { NextRequest, NextResponse } from 'next/server';
import { getAccount } from '@/lib/loyalty/loyalty-service';
import { cookies } from 'next/headers';

/**
 * GET /api/loyalty/balance
 * Get loyalty account balance and details
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('glowup_token');
    
    if (!token?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Extract userId from token (JWT decode)
    // For now, using a placeholder
    const userId = 'user_123'; // Replace with actual JWT decode

    const account = await getAccount(userId);

    return NextResponse.json({
      balance: account.balance,
      totalEarned: account.totalEarned,
      totalRedeemed: account.totalRedeemed,
      tier: account.tier,
      userId: account.userId,
    });
  } catch (error) {
    console.error('Failed to get loyalty balance:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve balance' },
      { status: 500 }
    );
  }
}
