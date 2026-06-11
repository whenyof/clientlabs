import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "clientlabs:ratelimit",
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  return { success, limit, reset, remaining }
}

// Límites estrictos para waitlist (anti-abuso/enumeración), además del global del middleware
const waitlistJoinRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "clientlabs:ratelimit:waitlist-join",
})

const waitlistConfirmRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "clientlabs:ratelimit:waitlist-confirm",
})

export async function checkWaitlistJoinLimit(identifier: string): Promise<boolean> {
  const { success } = await waitlistJoinRatelimit.limit(identifier)
  return success
}

export async function checkWaitlistConfirmLimit(identifier: string): Promise<boolean> {
  const { success } = await waitlistConfirmRatelimit.limit(identifier)
  return success
}
