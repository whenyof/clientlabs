import { Redis } from "@upstash/redis"

/**
 * 🚩 Institutional Redis Singleton (Upstash Compatible)
 * Provides an atomic, high-performance distributed store for
 * rate limiting and security telemetry.
 * 
 * Configured with environment variables directly for maximum security.
 */
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export default redis
