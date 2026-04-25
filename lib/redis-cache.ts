import { Redis } from "@upstash/redis"

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    return await redis.get<T>(key)
  } catch {
    return null
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  if (!redis) return
  try {
    await redis.set(key, data, { ex: ttlSeconds })
  } catch {
    // Redis failure is non-blocking
  }
}

export async function invalidateCachedData(prefix: string): Promise<void> {
  if (!redis) return
  try {
    const keys = await redis.keys(`${prefix}*`)
    if (keys.length > 0) {
      await redis.del(...keys as [string, ...string[]])
    }
  } catch {
    // Redis failure is non-blocking
  }
}
