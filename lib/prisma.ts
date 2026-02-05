import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL is not defined in environment variables")
}

/**
 * Prisma singleton
 * - Evita múltiples conexiones en dev (Next.js hot reload)
 * - Compatible con App Router + Server Actions
 * - Reduce errores `Error { kind: Closed }` en Neon
 */
export const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"] // ⛔ quita "query"
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export default prisma

/**
 * Checks if the database is available by executing a simple query.
 * Never throws, has a short timeout.
 * @returns {Promise<boolean>} True if DB is reachable
 */
export async function safeDbCheck(): Promise<boolean> {
  try {
    // We use a raw query or a very simple one like findFirst on a common table
    // $queryRaw is better but we can also use prisma.user.findFirst
    // Let's use a timeout-wrapped check
    const timeout = new Promise<boolean>((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 2500)
    )

    const check = prisma.$executeRawUnsafe("SELECT 1")

    await Promise.race([check, timeout])
    return true
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ [Database Check] Failed:", error)
    }
    return false
  }
}

/**
 * Executes a Prisma query with automatic retries for common connection errors.
 * Useful for Neon serverless environments where connections might be closed unexpectedly in dev.
 */
export async function safePrismaQuery<T>(
  operation: () => Promise<T>,
  retries = 1,
  delayMs = 300
): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Handle specific Prisma errors
    const errorMessage = error?.message || ""
    const errorCode = error?.code || ""

    const isConnectionError =
      errorCode === "P1001" || // Can't reach database server
      errorCode === "P1017" || // Server has closed the connection
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes("closed") ||
      error?.name === "PrismaClientInitializationError" ||
      error?.name === "PrismaClientKnownRequestError" && errorCode.startsWith("P10")

    if (isConnectionError && retries > 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`⚠️ [safePrismaQuery] Retrying query due to DB connection issue (${errorCode})... (${retries} retries left)`)
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return safePrismaQuery(operation, retries - 1, delayMs * 2) // Exponential backoff Lite
    }

    // Log the error but don't re-log connection failures redundantly
    if (!isConnectionError && process.env.NODE_ENV === "development") {
      console.error("❌ [Prisma Query Error]:", error)
    }

    throw error
  }
}