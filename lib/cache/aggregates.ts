/**
 * Caché Upstash para endpoints de agregados (KPIs, informes, dashboard).
 *
 * - Clave por usuario (los datos están scopeados por userId; cachear por
 *   workspace cruzaría datos entre miembros que ven su propio userId).
 * - Namespace común `agg:<userId>:` para poder invalidar todos de una vez.
 * - Fail-open: getCachedData/setCachedData/invalidateCachedData ya tragan
 *   cualquier fallo de Redis, así que un miss o un Upstash caído cae a BD.
 */
import { getCachedData, setCachedData, invalidateCachedData } from "@/lib/redis-cache"

export { getCachedData, setCachedData }

/** TTL por defecto para agregados (segundos). */
export const AGG_TTL = 60

/** Construye una clave de agregado namespaced por usuario. */
export function aggKey(userId: string, name: string, parts: Array<string | null | undefined> = []): string {
  const suffix = parts.map((p) => p ?? "").join(":")
  return suffix ? `agg:${userId}:${name}:${suffix}` : `agg:${userId}:${name}`
}

/**
 * Invalida los agregados cacheados de un usuario. Llamar tras escrituras que
 * cambien sumas/conteos (factura, gasto, venta, transacción, pago...).
 * Cubre el namespace nuevo `agg:` y las cachés financieras previas.
 */
export async function invalidateUserAggregates(userId: string): Promise<void> {
  await Promise.all([
    invalidateCachedData(`agg:${userId}:`),
    invalidateCachedData(`finance:dashboard:${userId}`),
    invalidateCachedData(`dashboard-v6-${userId}`),
  ])
}
