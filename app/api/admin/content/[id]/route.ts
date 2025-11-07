import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';
import { getPost, updatePost, deletePost } from '@/lib/content/content-service';
import { UpdatePostInput } from '@/types/content';

/**
 * GET /api/admin/content/[id]
 * Get post by ID (admin only, includes drafts)
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

    // Check admin access
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Failed to get post:', error);
    return NextResponse.json(
      { error: 'Failed to get post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/content/[id]
 * Update post (admin only, author or admin)
 */
export async function PUT(
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

    // Check admin access
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Check if post exists and user has permission
    const existingPost = await getPost(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only the author can update their post (unless they're admin)
    if (existingPost.author !== userId && !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own posts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: UpdatePostInput = body;

    const updatedPost = await updatePost(id, userId, updates);

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/content/[id]
 * Delete post (admin only, author or admin)
 */
export async function DELETE(
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

    // Check admin access
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Check if post exists and user has permission
    const existingPost = await getPost(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only the author can delete their post (unless they're admin)
    if (existingPost.author !== userId && !isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own posts' },
        { status: 403 }
      );
    }

    await deletePost(id, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
