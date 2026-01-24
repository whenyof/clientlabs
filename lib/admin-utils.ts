import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { AdminAction } from "@prisma/client"

/**
 * Extract client information from request headers
 */
export async function getClientInfo() {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    return { ipAddress, userAgent }
}

/**
 * Log an admin action to the AdminLog table
 */
export async function logAdminAction({
    adminId,
    adminEmail,
    action,
    targetType,
    targetId,
    targetEmail,
    metadata,
    ipAddress,
    userAgent,
}: {
    adminId: string
    adminEmail: string
    action: AdminAction
    targetType?: string
    targetId?: string
    targetEmail?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}) {
    try {
        await prisma.adminLog.create({
            data: {
                adminId,
                adminEmail,
                action,
                targetType,
                targetId,
                targetEmail,
                metadata: metadata || {},
                ipAddress: ipAddress || "unknown",
                userAgent: userAgent || "unknown",
            },
        })
    } catch (error) {
        console.error("Failed to log admin action:", error)
        // Don't throw - logging failure shouldn't break the action
    }
}

/**
 * Check if a user can be impersonated
 */
export async function canImpersonate(adminId: string, targetUserId: string): Promise<boolean> {
    // Can't impersonate yourself
    if (adminId === targetUserId) {
        return false
    }

    // Check if target user exists and is not blocked
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { isBlocked: true, isActive: true },
    })

    if (!targetUser || targetUser.isBlocked || !targetUser.isActive) {
        return false
    }

    // Check if there's already an active impersonation session for this admin
    const activeSession = await prisma.impersonationSession.findFirst({
        where: {
            adminId,
            endedAt: null,
        },
    })

    // Can't start new impersonation if one is already active
    return !activeSession
}

/**
 * Get active impersonation session for an admin
 */
export async function getActiveImpersonation(adminId: string) {
    return await prisma.impersonationSession.findFirst({
        where: {
            adminId,
            endedAt: null,
        },
        include: {
            targetUser: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    })
}

/**
 * Get active impersonation session by target user ID
 */
export async function getImpersonationByTargetUser(targetUserId: string) {
    return await prisma.impersonationSession.findFirst({
        where: {
            targetUserId,
            endedAt: null,
        },
        include: {
            admin: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    })
}
