import { createClient } from 'redis';

let client = null;
let isConnected = false;

export function isRedisEnabled() {
  return process.env.REDIS_ENABLED !== 'false';
}

export async function connectRedis() {
  if (!isRedisEnabled()) {
    console.log('Redis disabled (REDIS_ENABLED=false)');
    return null;
  }

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    client = createClient({ url });
    client.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });

    await client.connect();
    isConnected = true;
    console.log(`Redis connected at ${url}`);
    return client;
  } catch (err) {
    console.warn('Redis unavailable — API will run without cache:', err.message);
    client = null;
    isConnected = false;
    return null;
  }
}

export function getRedisClient() {
  return isConnected ? client : null;
}
