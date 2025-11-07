import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, incrementViewCount } from '@/lib/content/content-service';

/**
 * GET /api/content/[slug]
 * Get published post by slug (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only return published posts to public
    if (post.status !== 'published') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await incrementViewCount(post.id);

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Failed to get post:', error);
    return NextResponse.json(
      { error: 'Failed to get post' },
      { status: 500 }
    );
  }
}
