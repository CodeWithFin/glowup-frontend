import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { uploadPhoto, generateUploadSignature } from '@/lib/media/upload-service';
import { MediaUploadInput } from '@/types/routine';

/**
 * POST /api/media/upload
 * Upload photo for diary entry
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const routineId = formData.get('routineId') as string;
    const angle = formData.get('angle') as 'front' | 'left' | 'right' | 'closeup' | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const input: MediaUploadInput = {
      file: buffer,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId,
      routineId,
      angle,
    };

    const result = await uploadPhoto(input);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to upload photo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/media/upload-signature
 * Get signed URL for direct client upload
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

    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get('routineId') || undefined;

    const signature = await generateUploadSignature(userId, routineId);

    return NextResponse.json(signature);
  } catch (error: any) {
    console.error('Failed to generate upload signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
