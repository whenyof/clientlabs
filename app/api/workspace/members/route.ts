export const dynamic = "force-dynamic"
export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/workspace/members
 * Returns the list of workspace members for assignment dropdowns.
 * For users without a workspace, returns only themselves.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find the workspace this user belongs to (as owner or member)
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!workspace) {
      // No workspace — return just the current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true },
      })
      return NextResponse.json(user ? [{ id: user.id, name: user.name ?? user.email, email: user.email, image: user.image }] : [])
    }

    // Deduplicate owner + members
    const memberMap = new Map<string, { id: string; name: string | null; email: string; image: string | null }>()

    // Add owner
    memberMap.set(workspace.owner.id, workspace.owner)

    // Add members
    for (const m of workspace.members) {
      memberMap.set(m.user.id, m.user)
    }

    const members = Array.from(memberMap.values()).map((u) => ({
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      image: u.image,
    }))

    return NextResponse.json(members)
  } catch (error) {
    console.error("[GET /api/workspace/members]:", error)
    return NextResponse.json({ error: "Failed to load workspace members" }, { status: 500 })
  }
}
