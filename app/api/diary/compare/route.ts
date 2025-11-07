import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { comparePhotos } from '@/lib/routine/diary-service';
import { checkRoutineOwnership } from '@/lib/routine/routine-service';

/**
 * GET /api/diary/compare
 * Compare photos between two dates for a routine
 * Query params: routineId, startDate (timestamp), endDate (timestamp)
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

    // TODO: Extract userId from token
    const userId = 'user_123';

    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get('routineId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!routineId) {
      return NextResponse.json(
        { error: 'routineId is required' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Check routine ownership
    const ownsRoutine = await checkRoutineOwnership(routineId, userId);
    if (!ownsRoutine) {
      return NextResponse.json(
        { error: 'Routine not found or access denied' },
        { status: 404 }
      );
    }

    const comparison = await comparePhotos(
      routineId,
      userId,
      parseInt(startDate),
      parseInt(endDate)
    );

    if (!comparison) {
      return NextResponse.json(
        { error: 'No photos found for comparison in the specified date range' },
        { status: 404 }
      );
    }

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error('Failed to compare photos:', error);
    return NextResponse.json(
      { error: 'Failed to compare photos' },
      { status: 500 }
    );
  }
}
