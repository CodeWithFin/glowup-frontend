export type RoutineFrequency = 'daily' | 'weekly' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type SkinConcern = 'acne' | 'dryness' | 'oiliness' | 'aging' | 'dark_spots' | 'redness' | 'texture' | 'other';

export interface RoutineSchedule {
  frequency: RoutineFrequency;
  timesOfDay: TimeOfDay[];
  customDays?: number[]; // 0-6 for custom weekly schedule
}

export interface RoutineProduct {
  productId: string;
  title: string;
  order: number; // step order in routine
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  products: RoutineProduct[];
  schedule: RoutineSchedule;
  goals?: SkinConcern[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  productIds: string[];
  schedule: RoutineSchedule;
  goals?: SkinConcern[];
}

export interface UpdateRoutineInput {
  name?: string;
  description?: string;
  products?: RoutineProduct[];
  schedule?: RoutineSchedule;
  goals?: SkinConcern[];
  isActive?: boolean;
}

// Diary Entry Types
export interface PhotoMetadata {
  url: string;
  uploadedAt: number;
  width?: number;
  height?: number;
  fileSize?: number;
  angle?: 'front' | 'left' | 'right' | 'closeup'; // photo angle for comparison
}

export interface SkinMetrics {
  hydration?: number; // 0-100 score
  texture?: number; // 0-100 score
  brightness?: number; // 0-100 score
  clarity?: number; // 0-100 score
  overallScore?: number; // 0-100 calculated average
  concerns?: SkinConcern[];
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  routineId: string;
  userId: string;
  date: number; // timestamp of entry date (normalized to start of day)
  timeOfDay: TimeOfDay;
  photos: PhotoMetadata[];
  notes?: string;
  productsUsed?: string[]; // product IDs actually used
  skinMetrics?: SkinMetrics;
  mood?: 'great' | 'good' | 'okay' | 'poor';
  createdAt: number;
  updatedAt: number;
}

export interface CreateDiaryEntryInput {
  routineId: string;
  date?: number; // defaults to today
  timeOfDay: TimeOfDay;
  photoUrls?: string[]; // URLs of uploaded photos
  notes?: string;
  productsUsed?: string[];
  mood?: 'great' | 'good' | 'okay' | 'poor';
}

export interface UpdateDiaryEntryInput {
  notes?: string;
  productsUsed?: string[];
  skinMetrics?: SkinMetrics;
  mood?: 'great' | 'good' | 'okay' | 'poor';
}

// Photo Comparison
export interface PhotoComparison {
  routineId: string;
  startDate: number;
  endDate: number;
  startPhotos: PhotoMetadata[];
  endPhotos: PhotoMetadata[];
  startMetrics?: SkinMetrics;
  endMetrics?: SkinMetrics;
  progress?: {
    hydration: number; // difference
    texture: number;
    brightness: number;
    clarity: number;
    overall: number;
  };
  daysElapsed: number;
}

// Media Upload
export interface MediaUploadInput {
  file: File | Buffer;
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  routineId?: string;
  angle?: 'front' | 'left' | 'right' | 'closeup';
}

export interface MediaUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  uploadedAt: number;
}

// Constants
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_PHOTOS_PER_ENTRY = 5;
export const ROUTINE_TTL_SECONDS = 60 * 60 * 24 * 365 * 2; // 2 years
export const DIARY_ENTRY_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year
