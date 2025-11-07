import type { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

export async function getRedis() {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  const token = process.env.REDIS_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import('@upstash/redis');
  redisClient = new Redis({ url, token });
  return redisClient;
}

// Simple in-memory fallback for dev/local with same async API surface we need
const memory = new Map<string, { value: string; expiresAt?: number }>();

export const kv = {
  async get(key: string): Promise<string | null> {
    const redis = await getRedis();
    if (redis) return (await redis.get<string>(key)) ?? null;
    const v = memory.get(key);
    if (!v) return null;
    if (v.expiresAt && v.expiresAt < Date.now()) {
      memory.delete(key);
      return null;
    }
    return v.value;
  },
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redis = await getRedis();
    if (redis) {
      if (ttlSeconds) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
      return;
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    memory.set(key, { value, expiresAt });
  },
  async del(key: string): Promise<void> {
    const redis = await getRedis();
    if (redis) {
      await redis.del(key);
      return;
    }
    memory.delete(key);
  },
};
