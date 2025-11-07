import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '@/lib/routine/diary-service';
import { UpdateDiaryEntryInput } from '@/types/routine';

/**
 * GET /api/diary/entries/[id]
 * Get diary entry by ID
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

    const entry = await getDiaryEntry(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Diary entry not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (entry.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Failed to fetch diary entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary entry' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/diary/entries/[id]
 * Update diary entry
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
    const input: UpdateDiaryEntryInput = body;

    const updated = await updateDiaryEntry(id, userId, input);

    if (!updated) {
      return NextResponse.json(
        { error: 'Diary entry not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update diary entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update diary entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diary/entries/[id]
 * Delete diary entry
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

    const deleted = await deleteDiaryEntry(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Diary entry not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete diary entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete diary entry' },
      { status: 500 }
    );
  }
}
