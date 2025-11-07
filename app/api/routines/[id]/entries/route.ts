import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createDiaryEntry,
  getRoutineDiaryEntries,
} from '@/lib/routine/diary-service';
import { checkRoutineOwnership } from '@/lib/routine/routine-service';
import { CreateDiaryEntryInput, MAX_PHOTOS_PER_ENTRY } from '@/types/routine';

/**
 * POST /api/routines/[id]/entries
 * Create diary entry for a routine
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routineId } = await params;
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

    // Check routine ownership
    const ownsRoutine = await checkRoutineOwnership(routineId, userId);
    if (!ownsRoutine) {
      return NextResponse.json(
        { error: 'Routine not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const input: CreateDiaryEntryInput = {
      ...body,
      routineId,
    };

    // Validation
    if (!input.timeOfDay) {
      return NextResponse.json(
        { error: 'Time of day is required' },
        { status: 400 }
      );
    }

    if (input.photoUrls && input.photoUrls.length > MAX_PHOTOS_PER_ENTRY) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS_PER_ENTRY} photos allowed per entry` },
        { status: 400 }
      );
    }

    const entry = await createDiaryEntry(userId, input);

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create diary entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/routines/[id]/entries
 * Get all diary entries for a routine
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: routineId } = await params;
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

    // Check routine ownership
    const ownsRoutine = await checkRoutineOwnership(routineId, userId);
    if (!ownsRoutine) {
      return NextResponse.json(
        { error: 'Routine not found or access denied' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const entries = await getRoutineDiaryEntries(routineId, limit);

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error('Failed to fetch diary entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    );
  }
}
