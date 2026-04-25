export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { getUserWorkspace } from "@/lib/get-workspace"
import { TeamRole } from "@prisma/client"
import { z } from "zod"

const TEAM_LIMITS: Record<string, number> = {
  FREE: 1,
  PRO: 3,
  BUSINESS: 10,
}

const inviteSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const { email, role } = parsed.data

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })
  )

  const plan = user?.plan ?? "FREE"
  const limit = TEAM_LIMITS[plan] ?? 1

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result

  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para invitar miembros" }, { status: 403 })
  }

  const currentCount = workspace.members.length

  if (currentCount >= limit) {
    return NextResponse.json(
      { error: `Tu plan ${plan} permite un máximo de ${limit} miembro(s) de equipo. Actualiza tu plan para añadir más.` },
      { status: 403 }
    )
  }

  // Check for existing pending invite
  const existingInvite = await safePrismaQuery(() =>
    prisma.workspaceInvite.findFirst({
      where: { workspaceId: workspace.id, email },
    })
  )

  if (existingInvite) {
    return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 409 })
  }

  // Check if user is already a member
  const existingMember = workspace.members.find((m) => m.user.email === email)
  if (existingMember) {
    return NextResponse.json({ error: "Este usuario ya es miembro del equipo" }, { status: 409 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  const invite = await safePrismaQuery(() =>
    prisma.workspaceInvite.create({
      data: {
        workspaceId: workspace.id,
        email,
        role: role as TeamRole,
        expiresAt,
      },
    })
  )

  const inviteLink = `${process.env.NEXTAUTH_URL ?? "https://app.clientlabs.es"}/invite/${invite.token}`

  return NextResponse.json({ success: true, invite, inviteLink }, { status: 201 })
}
