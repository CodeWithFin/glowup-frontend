import { kv } from '../redis';
import {
  Routine,
  CreateRoutineInput,
  UpdateRoutineInput,
  RoutineProduct,
  ROUTINE_TTL_SECONDS,
} from '@/types/routine';
import { randomUUID } from 'crypto';

const ROUTINE_PREFIX = 'routine:';
const USER_ROUTINES_PREFIX = 'user_routines:';

/**
 * Normalize date to start of day UTC
 */
export function normalizeDate(timestamp?: number): number {
  const date = timestamp ? new Date(timestamp) : new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Create a new routine
 */
export async function createRoutine(
  userId: string,
  input: CreateRoutineInput
): Promise<Routine> {
  const now = Date.now();
  const routineId = randomUUID();

  // Convert product IDs to RoutineProduct objects
  const products: RoutineProduct[] = input.productIds.map((productId, index) => ({
    productId,
    title: `Product ${index + 1}`, // TODO: fetch actual product titles
    order: index + 1,
  }));

  const routine: Routine = {
    id: routineId,
    userId,
    name: input.name,
    description: input.description,
    products,
    schedule: input.schedule,
    goals: input.goals,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  // Save routine
  const routineKey = `${ROUTINE_PREFIX}${routineId}`;
  await kv.set(routineKey, JSON.stringify(routine), ROUTINE_TTL_SECONDS);

  // Add to user's routine index
  const userRoutinesKey = `${USER_ROUTINES_PREFIX}${userId}`;
  const userRoutinesRaw = await kv.get(userRoutinesKey);
  const userRoutines: string[] = userRoutinesRaw ? JSON.parse(userRoutinesRaw) : [];
  userRoutines.unshift(routineId); // most recent first
  await kv.set(userRoutinesKey, JSON.stringify(userRoutines), ROUTINE_TTL_SECONDS);

  return routine;
}

/**
 * Get routine by ID
 */
export async function getRoutine(routineId: string): Promise<Routine | null> {
  const routineKey = `${ROUTINE_PREFIX}${routineId}`;
  const raw = await kv.get(routineKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Routine;
  } catch {
    return null;
  }
}

/**
 * Get all routines for a user
 */
export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const userRoutinesKey = `${USER_ROUTINES_PREFIX}${userId}`;
  const userRoutinesRaw = await kv.get(userRoutinesKey);
  const routineIds: string[] = userRoutinesRaw ? JSON.parse(userRoutinesRaw) : [];

  const routines: Routine[] = [];
  for (const routineId of routineIds) {
    const routine = await getRoutine(routineId);
    if (routine) {
      routines.push(routine);
    }
  }

  return routines;
}

/**
 * Update routine
 */
export async function updateRoutine(
  routineId: string,
  userId: string,
  input: UpdateRoutineInput
): Promise<Routine | null> {
  const routine = await getRoutine(routineId);
  if (!routine || routine.userId !== userId) {
    return null;
  }

  const updatedRoutine: Routine = {
    ...routine,
    ...input,
    updatedAt: Date.now(),
  };

  const routineKey = `${ROUTINE_PREFIX}${routineId}`;
  await kv.set(routineKey, JSON.stringify(updatedRoutine), ROUTINE_TTL_SECONDS);

  return updatedRoutine;
}

/**
 * Delete routine
 */
export async function deleteRoutine(routineId: string, userId: string): Promise<boolean> {
  const routine = await getRoutine(routineId);
  if (!routine || routine.userId !== userId) {
    return false;
  }

  // Delete routine
  const routineKey = `${ROUTINE_PREFIX}${routineId}`;
  await kv.del(routineKey);

  // Remove from user's index
  const userRoutinesKey = `${USER_ROUTINES_PREFIX}${userId}`;
  const userRoutinesRaw = await kv.get(userRoutinesKey);
  if (userRoutinesRaw) {
    const userRoutines: string[] = JSON.parse(userRoutinesRaw);
    const filtered = userRoutines.filter((id) => id !== routineId);
    await kv.set(userRoutinesKey, JSON.stringify(filtered), ROUTINE_TTL_SECONDS);
  }

  return true;
}

/**
 * Check if user owns routine
 */
export async function checkRoutineOwnership(
  routineId: string,
  userId: string
): Promise<boolean> {
  const routine = await getRoutine(routineId);
  return routine?.userId === userId;
}
