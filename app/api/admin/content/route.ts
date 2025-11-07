import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';
import { createPost, listPosts } from '@/lib/content/content-service';
import { CreatePostInput, ContentListQuery } from '@/types/content';

/**
 * POST /api/admin/content
 * Create new blog post (admin only)
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

    // TODO: Extract userId from token
    const userId = 'user_123';

    // Check admin access
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input: CreatePostInput = body;

    // Validation
    if (!input.title || !input.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!input.content || !input.content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const post = await createPost(userId, input);

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/content
 * List all posts including drafts (admin only)
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

    // Check admin access
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const query: ContentListQuery = {
      status: searchParams.get('status') as any,
      type: searchParams.get('type') as any,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      author: searchParams.get('author') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
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
