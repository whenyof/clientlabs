/**
 * Daily route optimization: nearest-neighbor from base or first task.
 * Input: tasks with coordinates. Output: ordered visit list + estimated travel time.
 */

export type Point = { lat: number; lng: number }

export type TaskWithCoords = {
  id: string
  latitude: number | null
  longitude: number | null
}

const EARTH_RADIUS_KM = 6371
const DEFAULT_AVERAGE_SPEED_KMH = 30

/** Haversine distance in km between two points. */
export function haversineKm(a: Point, b: Point): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(x))
}

/** Travel time in minutes: distance_km / speed_kmh * 60. */
export function travelTimeMinutes(
  distanceKm: number,
  speedKmh: number = DEFAULT_AVERAGE_SPEED_KMH
): number {
  if (speedKmh <= 0) return 0
  return (distanceKm / speedKmh) * 60
}

/**
 * Build ordered list of task ids and total estimated travel time (minutes).
 * Start from base (if provided) or first task; then always pick nearest next.
 */
export function optimizeRoute(
  tasks: TaskWithCoords[],
  base: Point | null,
  speedKmh: number = DEFAULT_AVERAGE_SPEED_KMH
): { orderedTaskIds: string[]; estimatedTravelMinutes: number } {
  const withCoords = tasks.filter(
    (t): t is TaskWithCoords & { lat: number; lng: number } =>
      t.latitude != null &&
      t.longitude != null &&
      Number.isFinite(t.latitude) &&
      Number.isFinite(t.longitude)
  )
  if (withCoords.length === 0) {
    return { orderedTaskIds: [], estimatedTravelMinutes: 0 }
  }

  const points = new Map<string, Point>()
  for (const t of withCoords) {
    points.set(t.id, { lat: t.latitude!, lng: t.longitude! })
  }

  const remaining = new Set(withCoords.map((t) => t.id))
  const orderedTaskIds: string[] = []
  let totalMinutes = 0

  let current: Point
  let firstId: string | null = null

  if (base) {
    current = base
  } else {
    firstId = withCoords[0].id
    current = points.get(firstId)!
    remaining.delete(firstId)
    orderedTaskIds.push(firstId)
  }

  while (remaining.size > 0) {
    let nearestId: string | null = null
    let nearestDist = Infinity
    for (const id of remaining) {
      const p = points.get(id)!
      const d = haversineKm(current, p)
      if (d < nearestDist) {
        nearestDist = d
        nearestId = id
      }
    }
    if (nearestId == null) break
    remaining.delete(nearestId)
    orderedTaskIds.push(nearestId)
    totalMinutes += travelTimeMinutes(nearestDist, speedKmh)
    current = points.get(nearestId)!
  }

  if (base && firstId === null && orderedTaskIds.length > 0) {
    const last = points.get(orderedTaskIds[orderedTaskIds.length - 1])!
    totalMinutes += travelTimeMinutes(haversineKm(last, base), speedKmh)
  }

  return {
    orderedTaskIds,
    estimatedTravelMinutes: Math.round(totalMinutes * 100) / 100,
  }
}
