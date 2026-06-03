export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { getUserWorkspace } from "@/lib/get-workspace"
import { TeamRole } from "@prisma/client"
import { z } from "zod"
import { DEFAULT_PERMISSIONS } from "@/lib/role-permissions"

const updateSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result

  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para modificar miembros" }, { status: 403 })
  }

  const member = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { id, workspaceId: workspace.id },
    })
  )

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })
  }

  if (member.role === "OWNER") {
    return NextResponse.json({ error: "No se puede modificar al propietario" }, { status: 403 })
  }

  const newRole = parsed.data.role as TeamRole
  const rolePerms = DEFAULT_PERMISSIONS[newRole] ?? DEFAULT_PERMISSIONS["MEMBER"]

  const [updated] = await prisma.$transaction([
    prisma.workspaceMember.update({
      where: { id },
      data: { role: newRole },
    }),
    prisma.memberPermissions.upsert({
      where: { memberId: id },
      update: rolePerms,
      create: { memberId: id, ...rolePerms },
    }),
  ])

  return NextResponse.json({ success: true, member: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result

  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para eliminar miembros" }, { status: 403 })
  }

  const member = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { id, workspaceId: workspace.id },
    })
  )

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })
  }

  if (member.role === "OWNER") {
    return NextResponse.json({ error: "No se puede eliminar al propietario del workspace" }, { status: 403 })
  }

  await safePrismaQuery(() =>
    prisma.workspaceMember.delete({ where: { id } })
  )

  return NextResponse.json({ success: true })
}
