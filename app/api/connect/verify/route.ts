export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

    try {
        const eventsCount = await prisma.trackingEvent.count({
            where: { userId, createdAt: { gte: fiveMinAgo } }
        })

        return NextResponse.json({ connected: eventsCount > 0, eventsCount })
    } catch (err) {
        return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }
}
