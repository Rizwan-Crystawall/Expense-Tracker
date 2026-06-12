import { getRedisClient } from '../config/redis.js';

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 60;

export async function getCache(key) {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = DEFAULT_TTL) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // ignore
  }
}

export async function invalidateUserCache(userId) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keysToDelete = new Set([`accounts:${userId}`]);
    const patterns = [`dashboard:${userId}:*`, `transactions:${userId}:*`];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      keys.forEach((key) => keysToDelete.add(key));
    }

    if (keysToDelete.size > 0) {
      await redis.del([...keysToDelete]);
    }
  } catch {
    // ignore
  }
}

export function cacheKeys(userId) {
  return {
    accounts: `accounts:${userId}`,
    dashboard: (accountId, year, month, months) =>
      `dashboard:${userId}:${accountId || 'all'}:${year}:${month}:${months}`,
    transactions: (accountId) => `transactions:${userId}:${accountId}`,
  };
}
