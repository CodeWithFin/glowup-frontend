import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRoutine,
  getRoutine,
  getUserRoutines,
  updateRoutine,
  deleteRoutine,
  checkRoutineOwnership,
} from '../lib/routine/routine-service';
import { CreateRoutineInput, UpdateRoutineInput } from '../types/routine';

describe('Routine Service', () => {
  const testUserId = 'test-user-' + Date.now();

  const sampleRoutineInput: CreateRoutineInput = {
    name: 'Morning Skincare',
    description: 'My daily morning routine',
    productIds: ['prod_1', 'prod_2', 'prod_3'],
    schedule: {
      frequency: 'daily',
      timesOfDay: ['morning'],
    },
    goals: ['dryness', 'dark_spots'],
  };

  it('should create a new routine', async () => {
    const routine = await createRoutine(testUserId, sampleRoutineInput);

    expect(routine.id).toBeDefined();
    expect(routine.userId).toBe(testUserId);
    expect(routine.name).toBe(sampleRoutineInput.name);
    expect(routine.products).toHaveLength(3);
    expect(routine.products[0].productId).toBe('prod_1');
    expect(routine.products[0].order).toBe(1);
    expect(routine.isActive).toBe(true);
    expect(routine.goals).toEqual(['dryness', 'dark_spots']);
  });

  it('should get routine by ID', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);
    const fetched = await getRoutine(created.id);

    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);
    expect(fetched!.name).toBe(created.name);
  });

  it('should return null for non-existent routine', async () => {
    const fetched = await getRoutine('non-existent-id');
    expect(fetched).toBeNull();
  });

  it('should get all user routines', async () => {
    const userId = 'user-multi-' + Date.now();
    
    await createRoutine(userId, { ...sampleRoutineInput, name: 'Routine 1' });
    await createRoutine(userId, { ...sampleRoutineInput, name: 'Routine 2' });
    await createRoutine(userId, { ...sampleRoutineInput, name: 'Routine 3' });

    const routines = await getUserRoutines(userId);

    expect(routines).toHaveLength(3);
    // Most recent first
    expect(routines[0].name).toBe('Routine 3');
    expect(routines[1].name).toBe('Routine 2');
    expect(routines[2].name).toBe('Routine 1');
  });

  it('should update routine', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);

    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateRoutineInput = {
      name: 'Updated Morning Routine',
      description: 'Updated description',
      isActive: false,
    };

    const updated = await updateRoutine(created.id, testUserId, updateInput);

    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Updated Morning Routine');
    expect(updated!.description).toBe('Updated description');
    expect(updated!.isActive).toBe(false);
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
  });

  it('should not update routine for wrong user', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);
    const wrongUserId = 'wrong-user-' + Date.now();

    const updated = await updateRoutine(created.id, wrongUserId, {
      name: 'Hacked Name',
    });

    expect(updated).toBeNull();
  });

  it('should delete routine', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);

    const deleted = await deleteRoutine(created.id, testUserId);
    expect(deleted).toBe(true);

    const fetched = await getRoutine(created.id);
    expect(fetched).toBeNull();
  });

  it('should not delete routine for wrong user', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);
    const wrongUserId = 'wrong-user-' + Date.now();

    const deleted = await deleteRoutine(created.id, wrongUserId);
    expect(deleted).toBe(false);

    // Routine should still exist
    const fetched = await getRoutine(created.id);
    expect(fetched).not.toBeNull();
  });

  it('should check routine ownership', async () => {
    const created = await createRoutine(testUserId, sampleRoutineInput);

    const owns = await checkRoutineOwnership(created.id, testUserId);
    expect(owns).toBe(true);

    const doesNotOwn = await checkRoutineOwnership(created.id, 'other-user');
    expect(doesNotOwn).toBe(false);
  });

  it('should handle custom schedule', async () => {
    const customInput: CreateRoutineInput = {
      ...sampleRoutineInput,
      schedule: {
        frequency: 'custom',
        timesOfDay: ['morning', 'evening'],
        customDays: [1, 3, 5], // Mon, Wed, Fri
      },
    };

    const routine = await createRoutine(testUserId, customInput);

    expect(routine.schedule.frequency).toBe('custom');
    expect(routine.schedule.customDays).toEqual([1, 3, 5]);
    expect(routine.schedule.timesOfDay).toHaveLength(2);
  });
});
