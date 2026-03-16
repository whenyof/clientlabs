import { v4 as uuid } from "uuid"

export function createOptimisticId(prefix: string) {
  return `optimistic-${prefix}-${uuid()}`
}