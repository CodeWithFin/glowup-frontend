import { NextRequest, NextResponse } from 'next/server';
import { listPosts } from '@/lib/content/content-service';
import { ContentListQuery } from '@/types/content';

/**
 * GET /api/content
 * List published posts (public)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: ContentListQuery = {
      status: 'published', // Only published posts for public
      type: searchParams.get('type') as any,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      author: searchParams.get('author') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any || 'publishedAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
    };

    const result = await listPosts(query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to list posts:', error);
    return NextResponse.json(
      { error: 'Failed to list posts' },
      { status: 500 }
    );
  }
}
