export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        actionUrl: true,
        createdAt: true,
      },
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    })

    return NextResponse.json({ success: true, data: notifications, unreadCount })
  } catch (error) {
    console.error("Notifications list error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
