import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRoutine, getUserRoutines } from '@/lib/routine/routine-service';
import { CreateRoutineInput } from '@/types/routine';

/**
 * POST /api/routines
 * Create a new routine
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
    const userId = 'user_123';

    const body = await request.json();
    const input: CreateRoutineInput = body;

    // Validation
    if (!input.name || !input.name.trim()) {
      return NextResponse.json(
        { error: 'Routine name is required' },
        { status: 400 }
      );
    }

    if (!input.productIds || input.productIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one product is required' },
        { status: 400 }
      );
    }

    if (!input.schedule || !input.schedule.frequency) {
      return NextResponse.json(
        { error: 'Schedule is required' },
        { status: 400 }
      );
    }

    const routine = await createRoutine(userId, input);

    return NextResponse.json(routine, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create routine:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create routine' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/routines
 * Get all routines for authenticated user
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

    const routines = await getUserRoutines(userId);

    return NextResponse.json({ routines });
  } catch (error: any) {
    console.error('Failed to fetch routines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}
