import { describe, it, expect } from 'vitest';
import {
  validateUpload,
  uploadPhoto,
  generateUploadSignature,
} from '../lib/media/upload-service';
import { MediaUploadInput, MAX_PHOTO_SIZE, ALLOWED_PHOTO_TYPES } from '../types/routine';

describe('Media Upload Service', () => {
  const testUserId = 'upload-user-' + Date.now();

  it('should validate file size', () => {
    const tooLarge: MediaUploadInput = {
      file: Buffer.alloc(MAX_PHOTO_SIZE + 1),
      fileName: 'large.jpg',
      fileType: 'image/jpeg',
      fileSize: MAX_PHOTO_SIZE + 1,
      userId: testUserId,
    };

    const validation = validateUpload(tooLarge);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('too large');
  });

  it('should validate file type', () => {
    const invalidType: MediaUploadInput = {
      file: Buffer.alloc(1000),
      fileName: 'file.pdf',
      fileType: 'application/pdf',
      fileSize: 1000,
      userId: testUserId,
    };

    const validation = validateUpload(invalidType);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Invalid file type');
  });

  it('should validate allowed file types', () => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const fileType of validTypes) {
      const input: MediaUploadInput = {
        file: Buffer.alloc(1000),
        fileName: `file.${fileType.split('/')[1]}`,
        fileType,
        fileSize: 1000,
        userId: testUserId,
      };

      const validation = validateUpload(input);
      expect(validation.valid).toBe(true);
    }
  });

  it('should accept valid upload', () => {
    const validUpload: MediaUploadInput = {
      file: Buffer.alloc(1000),
      fileName: 'photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 1000,
      userId: testUserId,
    };

    const validation = validateUpload(validUpload);
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  it('should upload photo and return result', async () => {
    const input: MediaUploadInput = {
      file: Buffer.alloc(5000),
      fileName: 'test-photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 5000,
      userId: testUserId,
      routineId: 'routine_123',
      angle: 'front',
    };

    const result = await uploadPhoto(input);

    expect(result.url).toBeDefined();
    expect(result.url).toContain('cloudinary');
    expect(result.publicId).toBeDefined();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(result.format).toBeDefined();
    expect(result.uploadedAt).toBeGreaterThan(0);
  });

  it('should reject upload with invalid file', async () => {
    const invalid: MediaUploadInput = {
      file: Buffer.alloc(MAX_PHOTO_SIZE + 1),
      fileName: 'huge.jpg',
      fileType: 'image/jpeg',
      fileSize: MAX_PHOTO_SIZE + 1,
      userId: testUserId,
    };

    await expect(uploadPhoto(invalid)).rejects.toThrow();
  });

  it('should generate upload signature', async () => {
    const signature = await generateUploadSignature(testUserId, 'routine_123');

    expect(signature.signature).toBeDefined();
    expect(signature.timestamp).toBeGreaterThan(0);
    expect(signature.uploadUrl).toBeDefined();
    expect(signature.uploadUrl).toContain('cloudinary');
  });

  it('should include userId in public ID path', async () => {
    const input: MediaUploadInput = {
      file: Buffer.alloc(1000),
      fileName: 'user-photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 1000,
      userId: testUserId,
    };

    const result = await uploadPhoto(input);

    expect(result.publicId).toContain(testUserId);
    expect(result.publicId).toContain('routine');
  });

  it('should handle different image formats', async () => {
    const formats = [
      { fileType: 'image/jpeg', expectedFormat: 'jpeg' },
      { fileType: 'image/png', expectedFormat: 'png' },
      { fileType: 'image/webp', expectedFormat: 'webp' },
    ];

    for (const { fileType, expectedFormat } of formats) {
      const ext = fileType.split('/')[1];
      const input: MediaUploadInput = {
        file: Buffer.alloc(1000),
        fileName: `photo.${ext}`,
        fileType,
        fileSize: 1000,
        userId: testUserId,
      };

      const result = await uploadPhoto(input);
      expect(result.format).toBe(expectedFormat);
    }
  });
});
