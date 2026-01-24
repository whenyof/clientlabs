import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAdminAction, getClientInfo } from "@/lib/admin-utils"

export async function POST(request: NextRequest) {
    try {
        // Validate admin access
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, email: true, role: true },
        })

        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            )
        }

        const { ipAddress, userAgent } = await getClientInfo()

        // Create backup metadata entry
        const backup = await prisma.backupMetadata.create({
            data: {
                filename: `backup_${Date.now()}.sql`,
                size: BigInt(0), // Will be updated when backup completes
                location: "rclone://backups",
                triggeredBy: admin.id,
                status: "PENDING",
                type: "MANUAL",
            },
        })

        // Log the admin action
        await logAdminAction({
            adminId: admin.id,
            adminEmail: admin.email!,
            action: "BACKUP_TRIGGERED",
            targetType: "BACKUP",
            targetId: backup.id,
            metadata: { backupId: backup.id, filename: backup.filename },
            ipAddress,
            userAgent,
        })

        // TODO: Call VPS backup script endpoint here
        // For now, we'll just mark it as pending
        // In production, you would call your VPS backup endpoint:
        // await fetch(process.env.VPS_BACKUP_ENDPOINT, { method: 'POST' })

        return NextResponse.json({
            success: true,
            backupId: backup.id,
            status: backup.status,
            message: "Backup triggered successfully",
        })
    } catch (error) {
        console.error("Error triggering backup:", error)
        return NextResponse.json(
            { error: "Failed to trigger backup" },
            { status: 500 }
        )
    }
}
