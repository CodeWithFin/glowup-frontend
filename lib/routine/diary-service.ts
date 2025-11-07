import { kv } from '../redis';
import {
  DiaryEntry,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  PhotoMetadata,
  SkinMetrics,
  PhotoComparison,
  DIARY_ENTRY_TTL_SECONDS,
} from '@/types/routine';
import { randomUUID } from 'crypto';
import { normalizeDate } from './routine-service';

const DIARY_PREFIX = 'diary:';
const ROUTINE_DIARY_PREFIX = 'routine_diary:'; // Index: routineId -> entry IDs
const USER_DIARY_PREFIX = 'user_diary:'; // Index: userId -> entry IDs

/**
 * Create diary entry
 */
export async function createDiaryEntry(
  userId: string,
  input: CreateDiaryEntryInput
): Promise<DiaryEntry> {
  const now = Date.now();
  const entryId = randomUUID();
  const entryDate = normalizeDate(input.date);

  // Convert photo URLs to metadata
  const photos: PhotoMetadata[] = (input.photoUrls || []).map((url) => ({
    url,
    uploadedAt: now,
  }));

  const entry: DiaryEntry = {
    id: entryId,
    routineId: input.routineId,
    userId,
    date: entryDate,
    timeOfDay: input.timeOfDay,
    photos,
    notes: input.notes,
    productsUsed: input.productsUsed,
    mood: input.mood,
    createdAt: now,
    updatedAt: now,
  };

  // Save entry
  const entryKey = `${DIARY_PREFIX}${entryId}`;
  await kv.set(entryKey, JSON.stringify(entry), DIARY_ENTRY_TTL_SECONDS);

  // Add to routine's diary index
  const routineDiaryKey = `${ROUTINE_DIARY_PREFIX}${input.routineId}`;
  const routineDiaryRaw = await kv.get(routineDiaryKey);
  const routineDiary: string[] = routineDiaryRaw ? JSON.parse(routineDiaryRaw) : [];
  routineDiary.unshift(entryId); // most recent first
  if (routineDiary.length > 500) routineDiary.pop(); // keep last 500
  await kv.set(routineDiaryKey, JSON.stringify(routineDiary), DIARY_ENTRY_TTL_SECONDS);

  // Add to user's diary index
  const userDiaryKey = `${USER_DIARY_PREFIX}${userId}`;
  const userDiaryRaw = await kv.get(userDiaryKey);
  const userDiary: string[] = userDiaryRaw ? JSON.parse(userDiaryRaw) : [];
  userDiary.unshift(entryId);
  if (userDiary.length > 500) userDiary.pop();
  await kv.set(userDiaryKey, JSON.stringify(userDiary), DIARY_ENTRY_TTL_SECONDS);

  return entry;
}

/**
 * Get diary entry by ID
 */
export async function getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
  const entryKey = `${DIARY_PREFIX}${entryId}`;
  const raw = await kv.get(entryKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiaryEntry;
  } catch {
    return null;
  }
}

/**
 * Get all diary entries for a routine
 */
export async function getRoutineDiaryEntries(
  routineId: string,
  limit = 50
): Promise<DiaryEntry[]> {
  const routineDiaryKey = `${ROUTINE_DIARY_PREFIX}${routineId}`;
  const routineDiaryRaw = await kv.get(routineDiaryKey);
  const entryIds: string[] = routineDiaryRaw ? JSON.parse(routineDiaryRaw) : [];

  const entries: DiaryEntry[] = [];
  for (const entryId of entryIds.slice(0, limit)) {
    const entry = await getDiaryEntry(entryId);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Get all diary entries for a user
 */
export async function getUserDiaryEntries(
  userId: string,
  limit = 50
): Promise<DiaryEntry[]> {
  const userDiaryKey = `${USER_DIARY_PREFIX}${userId}`;
  const userDiaryRaw = await kv.get(userDiaryKey);
  const entryIds: string[] = userDiaryRaw ? JSON.parse(userDiaryRaw) : [];

  const entries: DiaryEntry[] = [];
  for (const entryId of entryIds.slice(0, limit)) {
    const entry = await getDiaryEntry(entryId);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Update diary entry
 */
export async function updateDiaryEntry(
  entryId: string,
  userId: string,
  input: UpdateDiaryEntryInput
): Promise<DiaryEntry | null> {
  const entry = await getDiaryEntry(entryId);
  if (!entry || entry.userId !== userId) {
    return null;
  }

  const updatedEntry: DiaryEntry = {
    ...entry,
    ...input,
    updatedAt: Date.now(),
  };

  const entryKey = `${DIARY_PREFIX}${entryId}`;
  await kv.set(entryKey, JSON.stringify(updatedEntry), DIARY_ENTRY_TTL_SECONDS);

  return updatedEntry;
}

/**
 * Delete diary entry
 */
export async function deleteDiaryEntry(entryId: string, userId: string): Promise<boolean> {
  const entry = await getDiaryEntry(entryId);
  if (!entry || entry.userId !== userId) {
    return false;
  }

  // Delete entry
  const entryKey = `${DIARY_PREFIX}${entryId}`;
  await kv.del(entryKey);

  // Remove from routine's index
  const routineDiaryKey = `${ROUTINE_DIARY_PREFIX}${entry.routineId}`;
  const routineDiaryRaw = await kv.get(routineDiaryKey);
  if (routineDiaryRaw) {
    const routineDiary: string[] = JSON.parse(routineDiaryRaw);
    const filtered = routineDiary.filter((id) => id !== entryId);
    await kv.set(routineDiaryKey, JSON.stringify(filtered), DIARY_ENTRY_TTL_SECONDS);
  }

  // Remove from user's index
  const userDiaryKey = `${USER_DIARY_PREFIX}${userId}`;
  const userDiaryRaw = await kv.get(userDiaryKey);
  if (userDiaryRaw) {
    const userDiary: string[] = JSON.parse(userDiaryRaw);
    const filtered = userDiary.filter((id) => id !== entryId);
    await kv.set(userDiaryKey, JSON.stringify(filtered), DIARY_ENTRY_TTL_SECONDS);
  }

  return true;
}

/**
 * Compare photos between two dates
 */
export async function comparePhotos(
  routineId: string,
  userId: string,
  startDate: number,
  endDate: number
): Promise<PhotoComparison | null> {
  const entries = await getRoutineDiaryEntries(routineId, 500);

  // Filter entries by user and date range
  const userEntries = entries.filter((e) => e.userId === userId);
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);

  // Find entries closest to start and end dates
  const startEntry = userEntries
    .filter((e) => e.date >= normalizedStart)
    .sort((a, b) => a.date - b.date)[0];

  const endEntry = userEntries
    .filter((e) => e.date <= normalizedEnd)
    .sort((a, b) => b.date - a.date)[0];

  if (!startEntry || !endEntry) {
    return null;
  }

  // Calculate progress if metrics exist
  let progress;
  if (startEntry.skinMetrics?.overallScore && endEntry.skinMetrics?.overallScore) {
    progress = {
      hydration: (endEntry.skinMetrics.hydration || 0) - (startEntry.skinMetrics.hydration || 0),
      texture: (endEntry.skinMetrics.texture || 0) - (startEntry.skinMetrics.texture || 0),
      brightness: (endEntry.skinMetrics.brightness || 0) - (startEntry.skinMetrics.brightness || 0),
      clarity: (endEntry.skinMetrics.clarity || 0) - (startEntry.skinMetrics.clarity || 0),
      overall: endEntry.skinMetrics.overallScore - startEntry.skinMetrics.overallScore,
    };
  }

  const daysElapsed = Math.floor((endEntry.date - startEntry.date) / (1000 * 60 * 60 * 24));

  return {
    routineId,
    startDate: startEntry.date,
    endDate: endEntry.date,
    startPhotos: startEntry.photos,
    endPhotos: endEntry.photos,
    startMetrics: startEntry.skinMetrics,
    endMetrics: endEntry.skinMetrics,
    progress,
    daysElapsed,
  };
}

/**
 * Calculate skin metrics progress
 */
export function calculateProgress(
  startMetrics: SkinMetrics,
  endMetrics: SkinMetrics
): { [key: string]: number } {
  return {
    hydration: (endMetrics.hydration || 0) - (startMetrics.hydration || 0),
    texture: (endMetrics.texture || 0) - (startMetrics.texture || 0),
    brightness: (endMetrics.brightness || 0) - (startMetrics.brightness || 0),
    clarity: (endMetrics.clarity || 0) - (startMetrics.clarity || 0),
    overall: (endMetrics.overallScore || 0) - (startMetrics.overallScore || 0),
  };
}
