import {
  MediaUploadInput,
  MediaUploadResult,
  MAX_PHOTO_SIZE,
  ALLOWED_PHOTO_TYPES,
} from '@/types/routine';

/**
 * Validate upload file
 */
export function validateUpload(input: MediaUploadInput): { valid: boolean; error?: string } {
  // Check file size
  if (input.fileSize > MAX_PHOTO_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_PHOTO_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_PHOTO_TYPES.includes(input.fileType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_PHOTO_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Upload photo to storage
 * This is a stub - in production, integrate with Cloudinary, S3, or similar
 */
export async function uploadPhoto(
  input: MediaUploadInput
): Promise<MediaUploadResult> {
  // Validate
  const validation = validateUpload(input);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // In production, upload to Cloudinary/S3
  // For now, return mock result
  const mockPublicId = `routine/${input.userId}/${Date.now()}-${input.fileName}`;
  const mockUrl = `https://res.cloudinary.com/demo/image/upload/${mockPublicId}`;

  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    url: mockUrl,
    publicId: mockPublicId,
    width: 1920, // mock dimensions
    height: 1080,
    format: input.fileType.split('/')[1],
    uploadedAt: Date.now(),
  };
}

/**
 * Delete photo from storage
 * Stub for production integration
 */
export async function deletePhoto(publicId: string): Promise<boolean> {
  // In production, delete from Cloudinary/S3
  console.log(`[Media Service] Delete photo: ${publicId}`);
  return true;
}

/**
 * Generate signed URL for secure upload
 * For client-side direct uploads to Cloudinary/S3
 */
export async function generateUploadSignature(
  userId: string,
  routineId?: string
): Promise<{ signature: string; timestamp: number; uploadUrl: string }> {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // In production, generate real Cloudinary signature
  // const signature = cloudinary.utils.api_sign_request(
  //   { timestamp, folder: `routine/${userId}` },
  //   process.env.CLOUDINARY_API_SECRET
  // );

  const mockSignature = `mock-signature-${timestamp}`;
  const uploadUrl = process.env.CLOUDINARY_UPLOAD_URL || 'https://api.cloudinary.com/v1_1/demo/image/upload';

  return {
    signature: mockSignature,
    timestamp,
    uploadUrl,
  };
}

/**
 * Extract image metadata (width, height, etc.)
 * Stub - in production, use sharp or similar library
 */
export async function extractImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
}> {
  // In production, use sharp:
  // const metadata = await sharp(buffer).metadata();
  // return { width: metadata.width!, height: metadata.height!, format: metadata.format! };

  return {
    width: 1920,
    height: 1080,
    format: 'jpeg',
  };
}
