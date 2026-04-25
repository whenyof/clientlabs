// lib/get-workspace.ts
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { cache } from "react"

export const getUserWorkspace = cache(async (userId: string) => {
  // First try: workspaces owned by user
  const owned = await safePrismaQuery(() =>
    prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })
  )
  if (owned) return { workspace: owned, role: "OWNER" as const }

  // Second try: workspace where user is a member
  const membership = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
      },
    })
  )
  if (membership) return { workspace: membership.workspace, role: membership.role }

  return null
})
