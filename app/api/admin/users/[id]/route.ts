import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/admin/users/[id]
 * 
 * Updates a user's role and/or plan
 * ADMIN ONLY - verified server-side
 */
export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
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

        // ✅ PARSE REQUEST BODY
        const body = await req.json()
        const { role, plan } = body

        // ✅ VALIDATE INPUT
        if (role && !["USER", "ADMIN"].includes(role)) {
            return NextResponse.json(
                { error: "Invalid role. Must be USER or ADMIN" },
                { status: 400 }
            )
        }

        if (plan && !["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
            return NextResponse.json(
                { error: "Invalid plan. Must be FREE, PRO, or ENTERPRISE" },
                { status: 400 }
            )
        }

        // ✅ CHECK IF USER EXISTS
        const targetUser = await prisma.user.findUnique({
            where: { id: params.id }
        })

        if (!targetUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // ✅ UPDATE USER
        const updateData: any = {}
        if (role) updateData.role = role
        if (plan) updateData.plan = plan

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                onboardingCompleted: true,
                createdAt: true,
                image: true,
            }
        })

        return NextResponse.json({ user: updatedUser }, { status: 200 })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
