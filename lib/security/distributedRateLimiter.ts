import { redis } from "./redis"
import { logger } from "@/lib/logger"

export interface RateLimitResult {
    allowed: boolean
    remaining: number
    retryAfterSeconds: number
}

const RATE_LIMIT_SCRIPT = `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
`

let cachedSha: string | null = null;

async function getScriptSha(): Promise<string> {
    if (cachedSha) return cachedSha
    try {
        // Institutional Load: No as any, using native SDK method
        cachedSha = await redis.scriptLoad(RATE_LIMIT_SCRIPT)
        return cachedSha
    } catch (err) {
        throw err
    }
}

// 🟢 Circuit Breaker State (Persistent context)
const BREAKER_STATE_KEY = "__cl_security_breaker_state"

interface BreakerState {
    healthy: boolean
    lastCheck: number
    failures: number
}

// Safe global access without plain 'as any' where possible
const globalObj = globalThis as unknown as Record<string, BreakerState>
if (!globalObj[BREAKER_STATE_KEY]) {
    globalObj[BREAKER_STATE_KEY] = {
        healthy: true,
        lastCheck: 0,
        failures: 0
    }
}
const lastState = globalObj[BREAKER_STATE_KEY]

const CIRCUIT_BREAKER_MAX_FAILURES = 3
const CIRCUIT_BREAKER_RESET_MS = 5000

/**
 * 🛡️ Distributed Rate Limiter v10.0
 * Thread-safe, multi-instance enforcement via Lua.
 * Hardened with fail-fast circuit breaker and strict type safety.
 */
export async function checkDistributedRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    const now = Date.now()

    // 1. Circuit Breaker Check
    if (!lastState.healthy && now - lastState.lastCheck < CIRCUIT_BREAKER_RESET_MS) {
        return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds }
    }

    const fullKey = `ratelimit:${key}`

    // Global timeout task (Internal to this function)
    const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("Distributed Rate Limit Timeout (350ms Cap)"))
        }, 350)
        if (timer.unref) timer.unref()
    })

    const executionPromise = (async (): Promise<RateLimitResult> => {
        const sha = await getScriptSha()
        let current: number

        try {
            // Attempt 1: EVALSHA
            const result = await redis.evalsha(sha, [fullKey], [windowSeconds])
            current = typeof result === 'number' ? result : Number(result)
        } catch (err: unknown) {
            // Handle NOSCRIPT retry
            const error = err as Error
            if (error.message?.includes("NOSCRIPT")) {
                cachedSha = null
                const newSha = await getScriptSha()
                const retryResult = await redis.evalsha(newSha, [fullKey], [windowSeconds])
                current = typeof retryResult === 'number' ? retryResult : Number(retryResult)
            } else {
                throw err
            }
        }

        const allowed = current <= limit
        const ttlResult = await redis.ttl(fullKey)
        const ttl = typeof ttlResult === 'number' ? ttlResult : Number(ttlResult)

        // Success: Reset metrics
        lastState.healthy = true
        lastState.lastCheck = now
        lastState.failures = 0

        return {
            allowed,
            remaining: Math.max(0, limit - current),
            retryAfterSeconds: allowed ? 0 : Math.max(0, ttl)
        }
    })()

    try {
        // Enforce the 350ms cap for the entire transaction
        return await Promise.race([executionPromise, timeoutPromise])
    } catch (err) {
        const error = err as Error
        lastState.failures++
        lastState.lastCheck = Date.now()

        if (lastState.failures >= CIRCUIT_BREAKER_MAX_FAILURES) {
            lastState.healthy = false
            logger.warn("redis_circuit_breaker_active", "Circuit breaker opened.", undefined, { failures: lastState.failures })
        }

        logger.error("redis_rate_limit_failure", "Failing safe (closed).", undefined, {
            key,
            error: error.message
        })

        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: windowSeconds
        }
    }
}
