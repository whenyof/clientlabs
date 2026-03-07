import { Redis } from "@upstash/redis"

/**
 * Single Redis client for the entire app and worker.
 * Do not create Redis clients anywhere else.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.log("✅ Redis client initialized")
}

export default redis
