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

const contactRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "clientlabs:ratelimit:contact",
})

export async function checkContactLimit(identifier: string): Promise<boolean> {
  const { success } = await contactRatelimit.limit(identifier)
  return success
}

// Extracción de gastos por PDF: cada llamada cuesta tokens de Claude.
// Límite por usuario: ráfaga horaria + tope diario. Evita martillear el endpoint.
const gastosExtractHourlyRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, "1 h"),
  analytics: true,
  prefix: "clientlabs:ratelimit:gastos-extract:h",
})

const gastosExtractDailyRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 d"),
  analytics: true,
  prefix: "clientlabs:ratelimit:gastos-extract:d",
})

export async function checkGastosExtractLimit(
  identifier: string
): Promise<{ success: boolean; reset: number }> {
  const hourly = await gastosExtractHourlyRatelimit.limit(identifier)
  if (!hourly.success) return { success: false, reset: hourly.reset }
  const daily = await gastosExtractDailyRatelimit.limit(identifier)
  if (!daily.success) return { success: false, reset: daily.reset }
  return { success: true, reset: 0 }
}
