import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getRoutine,
  updateRoutine,
  deleteRoutine,
  checkRoutineOwnership,
} from '@/lib/routine/routine-service';
import { UpdateRoutineInput } from '@/types/routine';

/**
 * GET /api/routines/[id]
 * Get routine by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const routine = await getRoutine(id);

    if (!routine) {
      return NextResponse.json(
        { error: 'Routine not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (routine.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(routine);
  } catch (error: any) {
    console.error('Failed to fetch routine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routine' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/routines/[id]
 * Update routine
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const input: UpdateRoutineInput = body;

    const updated = await updateRoutine(id, userId, input);

    if (!updated) {
      return NextResponse.json(
        { error: 'Routine not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update routine:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update routine' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routines/[id]
 * Delete routine
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const deleted = await deleteRoutine(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Routine not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete routine:', error);
    return NextResponse.json(
      { error: 'Failed to delete routine' },
      { status: 500 }
    );
  }
}
