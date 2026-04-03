import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCachedData<T>(key: string): Promise<T | null> {
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
  try {
    await redis.set(key, data, { ex: ttlSeconds })
  } catch {
    // Redis failure is non-blocking
  }
}

export async function invalidateCachedData(prefix: string): Promise<void> {
  try {
    const keys = await redis.keys(`${prefix}*`)
    if (keys.length > 0) {
      await redis.del(...keys as [string, ...string[]])
    }
  } catch {
    // Redis failure is non-blocking
  }
}
