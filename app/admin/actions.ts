"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction, getClientInfo, canImpersonate } from "@/lib/admin-utils"

/**
 * Validate that the current user is an admin
 */
async function requireAdmin() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, role: true },
    })

    if (!user || user.role !== "ADMIN") {
        throw new Error("Admin access required")
    }

    return user
}

/**
 * Change user role (USER/ADMIN)
 */
export async function changeUserRole(userId: string, newRole: "USER" | "ADMIN") {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    // Prevent self-demotion
    if (userId === admin.id && newRole === "USER") {
        throw new Error("Cannot demote yourself from admin")
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    const oldRole = targetUser.role

    // Update user role
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "ROLE_CHANGED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: { oldRole, newRole },
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Change user plan (FREE/PRO/ENTERPRISE)
 */
export async function changeUserPlan(userId: string, newPlan: "FREE" | "PRO" | "ENTERPRISE") {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, plan: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    const oldPlan = targetUser.plan

    // Update user plan
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { plan: newPlan },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "PLAN_CHANGED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: { oldPlan, newPlan },
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Block a user
 */
export async function blockUser(userId: string, reason: string) {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    // Prevent self-blocking
    if (userId === admin.id) {
        throw new Error("Cannot block yourself")
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: true,
            blockedAt: new Date(),
            blockedReason: reason,
        },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_BLOCKED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: { reason },
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string) {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: false,
            blockedAt: null,
            blockedReason: null,
        },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_UNBLOCKED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: {},
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Activate a user
 */
export async function activateUser(userId: string) {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_ACTIVATED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: {},
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Deactivate a user
 */
export async function deactivateUser(userId: string) {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    // Prevent self-deactivation
    if (userId === admin.id) {
        throw new Error("Cannot deactivate yourself")
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_DEACTIVATED",
        targetType: "USER",
        targetId: userId,
        targetEmail: targetUser.email,
        metadata: {},
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true, user: updatedUser }
}

/**
 * Start impersonation session
 */
export async function startImpersonation(targetUserId: string) {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    // Validate impersonation is allowed
    const allowed = await canImpersonate(admin.id, targetUserId)
    if (!allowed) {
        throw new Error("Cannot impersonate this user")
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true, name: true },
    })

    if (!targetUser) {
        throw new Error("User not found")
    }

    // Create impersonation session
    const session = await prisma.impersonationSession.create({
        data: {
            adminId: admin.id,
            targetUserId,
            ipAddress,
        },
    })

    // Log the action
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_IMPERSONATED",
        targetType: "USER",
        targetId: targetUserId,
        targetEmail: targetUser.email,
        metadata: { sessionId: session.id },
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return {
        success: true,
        sessionId: session.id,
        targetUser: {
            id: targetUserId,
            email: targetUser.email,
            name: targetUser.name,
        }
    }
}

/**
 * End impersonation session
 */
export async function endImpersonation() {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getClientInfo()

    // Find active impersonation session
    const session = await prisma.impersonationSession.findFirst({
        where: {
            adminId: admin.id,
            endedAt: null,
        },
        include: {
            targetUser: {
                select: { email: true },
            },
        },
    })

    if (!session) {
        throw new Error("No active impersonation session")
    }

    // End the session
    await prisma.impersonationSession.update({
        where: { id: session.id },
        data: { endedAt: new Date() },
    })

    // Log the action (optional - could be tracked separately)
    await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "USER_FORCE_LOGOUT",
        targetType: "USER",
        targetId: session.targetUserId,
        targetEmail: session.targetUser.email,
        metadata: { sessionId: session.id, action: "end_impersonation" },
        ipAddress,
        userAgent,
    })

    revalidatePath("/admin/users")
    revalidatePath("/admin/logs")

    return { success: true }
}
