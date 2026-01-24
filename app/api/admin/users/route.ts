import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users
 * 
 * Returns all users in the system
 * ADMIN ONLY - verified server-side
 */
export async function GET(req: NextRequest) {
    try {
        // ✅ SERVER-SIDE ADMIN CHECK
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // ✅ VERIFY ADMIN ROLE FROM DATABASE
        const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (adminUser?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            )
        }

        // ✅ FETCH ALL USERS
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                onboardingCompleted: true,
                createdAt: true,
                image: true,
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ users }, { status: 200 })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
