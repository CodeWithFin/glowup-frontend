import { describe, it, expect } from 'vitest';
import {
  createDiaryEntry,
  getDiaryEntry,
  getRoutineDiaryEntries,
  updateDiaryEntry,
  deleteDiaryEntry,
  comparePhotos,
} from '../lib/routine/diary-service';
import { createRoutine } from '../lib/routine/routine-service';
import { CreateDiaryEntryInput, SkinMetrics } from '../types/routine';

describe('Diary Service', () => {
  const testUserId = 'diary-user-' + Date.now();

  async function createTestRoutine(userId: string) {
    return createRoutine(userId, {
      name: 'Test Routine',
      productIds: ['prod_1'],
      schedule: { frequency: 'daily', timesOfDay: ['morning'] },
    });
  }

  it('should create diary entry', async () => {
    const routine = await createTestRoutine(testUserId);

    const input: CreateDiaryEntryInput = {
      routineId: routine.id,
      timeOfDay: 'morning',
      notes: 'Feeling great today',
      mood: 'good',
      photoUrls: ['https://example.com/photo1.jpg'],
      productsUsed: ['prod_1'],
    };

    const entry = await createDiaryEntry(testUserId, input);

    expect(entry.id).toBeDefined();
    expect(entry.routineId).toBe(routine.id);
    expect(entry.userId).toBe(testUserId);
    expect(entry.timeOfDay).toBe('morning');
    expect(entry.notes).toBe('Feeling great today');
    expect(entry.mood).toBe('good');
    expect(entry.photos).toHaveLength(1);
    expect(entry.productsUsed).toEqual(['prod_1']);
  });

  it('should get diary entry by ID', async () => {
    const routine = await createTestRoutine(testUserId);
    const created = await createDiaryEntry(testUserId, {
      routineId: routine.id,
      timeOfDay: 'evening',
      notes: 'Test entry',
    });

    const fetched = await getDiaryEntry(created.id);

    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);
    expect(fetched!.notes).toBe('Test entry');
  });

  it('should get routine diary entries', async () => {
    const userId = 'diary-list-' + Date.now();
    const routine = await createTestRoutine(userId);

    // Create multiple entries
    await createDiaryEntry(userId, {
      routineId: routine.id,
      timeOfDay: 'morning',
      notes: 'Entry 1',
    });
    await createDiaryEntry(userId, {
      routineId: routine.id,
      timeOfDay: 'evening',
      notes: 'Entry 2',
    });
    await createDiaryEntry(userId, {
      routineId: routine.id,
      timeOfDay: 'morning',
      notes: 'Entry 3',
    });

    const entries = await getRoutineDiaryEntries(routine.id, 10);

    expect(entries).toHaveLength(3);
    // Most recent first
    expect(entries[0].notes).toBe('Entry 3');
    expect(entries[2].notes).toBe('Entry 1');
  });

  it('should update diary entry', async () => {
    const routine = await createTestRoutine(testUserId);
    const created = await createDiaryEntry(testUserId, {
      routineId: routine.id,
      timeOfDay: 'morning',
      notes: 'Original note',
    });

    const skinMetrics: SkinMetrics = {
      hydration: 75,
      texture: 80,
      brightness: 70,
      clarity: 85,
      overallScore: 77,
    };

    const updated = await updateDiaryEntry(created.id, testUserId, {
      notes: 'Updated note',
      skinMetrics,
      mood: 'great',
    });

    expect(updated).not.toBeNull();
    expect(updated!.notes).toBe('Updated note');
    expect(updated!.mood).toBe('great');
    expect(updated!.skinMetrics?.hydration).toBe(75);
    expect(updated!.skinMetrics?.overallScore).toBe(77);
  });

  it('should not update entry for wrong user', async () => {
    const routine = await createTestRoutine(testUserId);
    const created = await createDiaryEntry(testUserId, {
      routineId: routine.id,
      timeOfDay: 'morning',
    });

    const updated = await updateDiaryEntry(created.id, 'wrong-user', {
      notes: 'Hacked note',
    });

    expect(updated).toBeNull();
  });

  it('should delete diary entry', async () => {
    const routine = await createTestRoutine(testUserId);
    const created = await createDiaryEntry(testUserId, {
      routineId: routine.id,
      timeOfDay: 'morning',
    });

    const deleted = await deleteDiaryEntry(created.id, testUserId);
    expect(deleted).toBe(true);

    const fetched = await getDiaryEntry(created.id);
    expect(fetched).toBeNull();
  });

  it('should compare photos between dates', async () => {
    const userId = 'compare-user-' + Date.now();
    const routine = await createTestRoutine(userId);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Create start entry
    const startEntry = await createDiaryEntry(userId, {
      routineId: routine.id,
      date: weekAgo,
      timeOfDay: 'morning',
      photoUrls: ['https://example.com/start.jpg'],
    });

    // Add skin metrics to start entry
    await updateDiaryEntry(startEntry.id, userId, {
      skinMetrics: {
        hydration: 60,
        texture: 55,
        brightness: 50,
        clarity: 58,
        overallScore: 56,
      },
    });

    // Create end entry
    const endEntry = await createDiaryEntry(userId, {
      routineId: routine.id,
      date: now,
      timeOfDay: 'morning',
      photoUrls: ['https://example.com/end.jpg'],
    });

    // Add skin metrics to end entry
    await updateDiaryEntry(endEntry.id, userId, {
      skinMetrics: {
        hydration: 75,
        texture: 70,
        brightness: 68,
        clarity: 72,
        overallScore: 71,
      },
    });

    const comparison = await comparePhotos(routine.id, userId, weekAgo, now);

    expect(comparison).not.toBeNull();
    expect(comparison!.routineId).toBe(routine.id);
    expect(comparison!.startPhotos).toHaveLength(1);
    expect(comparison!.endPhotos).toHaveLength(1);
    expect(comparison!.daysElapsed).toBeGreaterThanOrEqual(6);
    expect(comparison!.progress).toBeDefined();
    expect(comparison!.progress!.hydration).toBe(15); // 75 - 60
    expect(comparison!.progress!.overall).toBe(15); // 71 - 56
  });

  it('should return null when no photos for comparison', async () => {
    const userId = 'no-photos-' + Date.now();
    const routine = await createTestRoutine(userId);

    const comparison = await comparePhotos(
      routine.id,
      userId,
      Date.now() - 1000,
      Date.now()
    );

    expect(comparison).toBeNull();
  });

  it('should handle multiple photos per entry', async () => {
    const routine = await createTestRoutine(testUserId);

    const entry = await createDiaryEntry(testUserId, {
      routineId: routine.id,
      timeOfDay: 'morning',
      photoUrls: [
        'https://example.com/front.jpg',
        'https://example.com/left.jpg',
        'https://example.com/right.jpg',
      ],
    });

    expect(entry.photos).toHaveLength(3);
    expect(entry.photos[0].url).toBe('https://example.com/front.jpg');
  });
});
