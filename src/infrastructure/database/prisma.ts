// Re-export from the canonical singleton to avoid duplicate PrismaClient instances
export { prisma, default, safeDbCheck, safePrismaQuery } from "@/lib/prisma"

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

