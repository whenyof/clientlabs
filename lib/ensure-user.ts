import { prisma, safePrismaQuery } from "@/lib/prisma"

/**
 * Ensures a user exists in the database based on session data.
 * Optimized for production stability.
 */
export async function ensureUserExists(sessionUser: {
    id: string
    email?: string | null
    name?: string | null
}) {
    // 🛡️ Guard: Valid session info
    if (!sessionUser.id) return null

    try {
        // 1. Try to find the user using the retry-capable wrapper
        const user = await safePrismaQuery(() =>
            prisma.user.findUnique({
                where: { id: sessionUser.id },
            })
        )

        // 2. If user exists, we are done
        if (user) return user

        // 3. Create user if not found
        console.log(`[ensureUserExists] User ${sessionUser.id} not found. Creating...`)

        return await safePrismaQuery(() =>
            prisma.user.create({
                data: {
                    id: sessionUser.id,
                    email: sessionUser.email ?? "",
                    name: sessionUser.name ?? "",
                    onboardingCompleted: false,
                },
            })
        )
    } catch (error) {
        // 🚨 FAIL-SAFE LOGIC
        console.error("[ensureUserExists] critical failure:", error)

        if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ [Development Mode] Ignoring ensureUserExists failure to allow app startup.")
            return { id: sessionUser.id, onboardingCompleted: true } // Mock user to allow bypass
        }

        // In production, we throw so the action fails clearly
        throw new Error("Unable to verify user account. Please check database connection.")
    }
}
