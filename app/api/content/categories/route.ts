import { NextRequest, NextResponse } from 'next/server';
import { listCategories } from '@/lib/content/content-service';

/**
 * GET /api/content/categories
 * List all categories (public)
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await listCategories();

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Failed to list categories:', error);
    return NextResponse.json(
      { error: 'Failed to list categories' },
      { status: 500 }
    );
  }
}
