export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { getUserWorkspace } from "@/lib/get-workspace"
import { z } from "zod"

const permissionsSchema = z.object({
  createInvoices:    z.boolean().optional(),
  editInvoices:      z.boolean().optional(),
  deleteInvoices:    z.boolean().optional(),
  issueInvoices:     z.boolean().optional(),
  viewInvoices:      z.boolean().optional(),
  createDocuments:   z.boolean().optional(),
  editDocuments:     z.boolean().optional(),
  deleteDocuments:   z.boolean().optional(),
  createClients:     z.boolean().optional(),
  editClients:       z.boolean().optional(),
  deleteClients:     z.boolean().optional(),
  viewAllClients:    z.boolean().optional(),
  viewLeads:         z.boolean().optional(),
  editLeads:         z.boolean().optional(),
  deleteLeads:       z.boolean().optional(),
  viewReports:       z.boolean().optional(),
  exportData:        z.boolean().optional(),
  createAutomations: z.boolean().optional(),
  editAutomations:   z.boolean().optional(),
  deleteAutomations: z.boolean().optional(),
  inviteMembers:     z.boolean().optional(),
  manageMembers:     z.boolean().optional(),
  manageSettings:    z.boolean().optional(),
  manageBilling:     z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = permissionsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result

  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para gestionar permisos" }, { status: 403 })
  }

  const member = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { id, workspaceId: workspace.id },
      select: { id: true, role: true },
    })
  )

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })
  }

  if (member.role === "OWNER") {
    return NextResponse.json({ error: "No se pueden modificar los permisos del propietario" }, { status: 403 })
  }

  const permissions = await safePrismaQuery(() =>
    prisma.memberPermissions.upsert({
      where: { memberId: id },
      create: { memberId: id, ...parsed.data },
      update: parsed.data,
    })
  )

  return NextResponse.json({ success: true, permissions })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const member = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { id, workspaceId: workspace.id },
      select: { role: true, permissions: true },
    })
  )

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, role: member.role, permissions: member.permissions })
}
