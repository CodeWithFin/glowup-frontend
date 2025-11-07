import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBooking } from '@/lib/consultation/consultation-service';

/**
 * GET /api/consultations/[id]
 * Get consultation booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('glowup_token');

    if (!token?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Extract userId from token
    const userId = 'user_123';

    const { id } = await params;
    const booking = await getBooking(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check ownership (user can only see their own bookings)
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only view your own bookings' },
        { status: 403 }
      );
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Failed to get booking:', error);
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    );
  }
}
