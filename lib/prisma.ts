import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not defined in environment variables")
}

/**
 * Prisma singleton: one client per process.
 * - globalThis prevents multiple instances on Next.js hot reload in dev.
 * - Single read+assign so no race when the module is first loaded.
 * - Neon/pgbouncer: set DATABASE_URL to the pooled endpoint (e.g. *-pooler.region.neon.tech)
 *   so serverless does not exhaust the connection limit.
 */
const globalForPrisma = globalThis as typeof globalThis & { __prisma?: PrismaClient }
export const prisma =
  globalForPrisma.__prisma ??
  (globalForPrisma.__prisma = new PrismaClient({
    log: ["error"],
  }))

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma
}

export default prisma

/**
 * Checks if the database is available. Never throws; short timeout.
 */
export async function safeDbCheck(): Promise<boolean> {
  try {
    const timeout = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 2500)
    )
    const check = prisma.$executeRawUnsafe("SELECT 1")
    await Promise.race([check, timeout])
    return true
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Database Check] Failed:", error)
    }
    return false
  }
}

/**
 * Executes a Prisma query with retries for connection errors (Neon/serverless).
 */
export async function safePrismaQuery<T>(
  operation: () => Promise<T>,
  retries = 1,
  delayMs = 300
): Promise<T> {
  try {
    return await operation()
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; name?: string }
    const code = err?.code ?? ""
    const msg = String(err?.message ?? "")
    const isConnectionError =
      code === "P1001" ||
      code === "P1017" ||
      msg.includes("Can't reach database server") ||
      msg.includes("closed") ||
      err?.name === "PrismaClientInitializationError" ||
      (err?.name === "PrismaClientKnownRequestError" && code.startsWith("P10"))

    if (isConnectionError && retries > 0) {
      await new Promise((r) => setTimeout(r, delayMs))
      return safePrismaQuery(operation, retries - 1, delayMs * 2)
    }
    if (!isConnectionError && process.env.NODE_ENV === "development") {
      console.error("[Prisma Query Error]:", error)
    }
    throw error
  }
}