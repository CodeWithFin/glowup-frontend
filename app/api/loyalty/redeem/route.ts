import { NextRequest, NextResponse } from 'next/server';
import { debitPoints, validateRedemption, convertPointsToKES } from '@/lib/loyalty/loyalty-service';
import { cookies } from 'next/headers';

/**
 * POST /api/loyalty/redeem
 * Redeem loyalty points for discount
 * Body: { points: number, orderId?: string }
 */
export async function POST(request: NextRequest) {
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
    const userId = 'user_123'; // Replace with actual JWT decode

    const body = await request.json();
    const { points, orderId } = body;

    if (!points || typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'Invalid points value' },
        { status: 400 }
      );
    }

    // Validate redemption is possible
    const validation = await validateRedemption(userId, points);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process redemption
    const transaction = await debitPoints(
      userId,
      points,
      `Redeemed ${points} points for KES ${validation.discountKES} discount`,
      { orderId }
    );

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        points: transaction.points,
        balance: transaction.balance,
        discountKES: validation.discountKES,
      },
    });
  } catch (error: any) {
    console.error('Failed to redeem points:', error);
    
    // Return specific error messages
    if (error.message?.includes('Insufficient balance') || error.message?.includes('Minimum redemption')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to redeem points' },
      { status: 500 }
    );
  }
}
