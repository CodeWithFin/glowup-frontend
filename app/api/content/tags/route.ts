import { NextRequest, NextResponse } from 'next/server';
import { listTags } from '@/lib/content/content-service';

/**
 * GET /api/content/tags
 * List all tags (public)
 */
export async function GET(request: NextRequest) {
  try {
    const tags = await listTags();

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error('Failed to list tags:', error);
    return NextResponse.json(
      { error: 'Failed to list tags' },
      { status: 500 }
    );
  }
}
