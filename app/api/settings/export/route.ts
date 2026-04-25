export const maxDuration = 30
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, clients, leads, teamMembers] = await safePrismaQuery(() =>
    Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          plan: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.client.findMany({
        where: { userId },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
        take: 1000,
      }),
      prisma.lead.findMany({
        where: { userId },
        select: { id: true, name: true, email: true, status: true, createdAt: true },
        take: 1000,
      }),
      prisma.teamMember.findMany({
        where: { userId },
        select: { id: true, email: true, role: true, status: true, createdAt: true },
      }),
    ])
  )

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    clients,
    leads,
    teamMembers,
  }

  const json = JSON.stringify(exportData, null, 2)
  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="clientlabs-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  })
}
