export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TeamRole } from "@prisma/client"

const TEAM_LIMITS: Record<string, number> = {
  FREE: 1,
  TRIAL: 5,
  STARTER: 1,
  PRO: 5,
  BUSINESS: Infinity,
}

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debes iniciar sesión para aceptar la invitación" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 })
  }

  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token: parsed.data.token },
      include: {
        workspace: {
          include: {
            owner: {
              select: {
                plan: true,
                BusinessProfile: { select: { extraSeats: true } },
              },
            },
            members: { select: { id: true, userId: true } },
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invitación no encontrada o ya utilizada" }, { status: 404 })
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Esta invitación ha expirado" }, { status: 410 })
    }

    const plan = invite.workspace.owner.plan ?? "STARTER"
    const extraSeats = invite.workspace.owner.BusinessProfile?.extraSeats ?? 0
    const baseLimit = TEAM_LIMITS[plan] ?? 1
    const limit = baseLimit === Infinity ? Infinity : baseLimit + extraSeats
    const memberCount = invite.workspace.members.length

    if (memberCount >= limit) {
      return NextResponse.json(
        { error: "LIMIT_REACHED", message: "El equipo ha alcanzado el límite de usuarios de su plan" },
        { status: 403 }
      )
    }

    const alreadyMember = invite.workspace.members.some(m => m.userId === session.user.id)
    if (alreadyMember) {
      return NextResponse.json({ error: "Ya eres miembro de este equipo" }, { status: 409 })
    }

    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
          role: invite.role as TeamRole,
        },
      }),
      prisma.workspaceInvite.delete({ where: { id: invite.id } }),
    ])

    return NextResponse.json({ success: true, workspaceName: invite.workspace.name })
  } catch (err) {
    console.error("[api/settings/team/invite/accept]", err)
    return NextResponse.json({ error: "Error al procesar la invitación" }, { status: 500 })
  }
}
