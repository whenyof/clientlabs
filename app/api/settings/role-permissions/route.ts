export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUserWorkspace } from "@/lib/get-workspace"
import { DEFAULT_PERMISSIONS } from "@/lib/role-permissions"
import { z } from "zod"

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ permissions: DEFAULT_PERMISSIONS })
  }

  const saved = ((result.workspace.settings as any)?.rolePermissions ?? {}) as Record<string, Record<string, boolean>>

  // Merge: saved values override defaults role by role
  const permissions: Record<string, Record<string, boolean>> = {}
  for (const role of Object.keys(DEFAULT_PERMISSIONS)) {
    permissions[role] = { ...(DEFAULT_PERMISSIONS[role] as any), ...(saved[role] ?? {}) }
  }

  return NextResponse.json({ permissions })
}

const patchSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "SALES", "MEMBER", "VIEWER"]),
  permissions: z.record(z.string(), z.boolean()),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { role, permissions } = parsed.data

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result
  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para editar roles" }, { status: 403 })
  }

  // Persist role defaults in workspace.settings.rolePermissions
  const currentSettings = (workspace.settings as any) ?? {}
  const currentRolePerms = currentSettings.rolePermissions ?? {}

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id, role: role as any },
    select: { id: true },
  })

  await Promise.all([
    // Save role defaults persistently
    prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        settings: {
          ...currentSettings,
          rolePermissions: { ...currentRolePerms, [role]: permissions },
        },
      },
    }),
    // Update all current members with this role
    ...members.map((m) =>
      prisma.memberPermissions.upsert({
        where: { memberId: m.id },
        update: permissions,
        create: { memberId: m.id, ...permissions },
      })
    ),
  ])

  return NextResponse.json({ success: true, updated: members.length })
}
