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
  TRIAL: 5,
  STARTER: 1,
  PRO: 5,
  BUSINESS: Infinity,
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const [user, profile] = await Promise.all([
    safePrismaQuery(() =>
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, name: true, email: true },
      })
    ),
    safePrismaQuery(() =>
      prisma.businessProfile.findUnique({
        where: { userId: session.user.id },
        select: { extraSeats: true },
      })
    ),
  ])
  const extraSeats = profile?.extraSeats ?? 0

  const result = await getUserWorkspace(session.user.id)

  if (!result) {
    // Auto-create workspace if user doesn't have one yet
    const workspace = await safePrismaQuery(() =>
      prisma.workspace.create({
        data: {
          name: `Workspace de ${user?.name ?? user?.email ?? session.user.id}`,
          ownerId: session.user.id,
          members: {
            create: { userId: session.user.id, role: "OWNER" },
          },
        },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      })
    )

    const plan = user?.plan ?? "STARTER"
    return NextResponse.json({
      success: true,
      myRole: "OWNER",
      plan,
      limit: TEAM_LIMITS[plan] === Infinity ? Infinity : (TEAM_LIMITS[plan] ?? 1) + extraSeats,
      members: workspace.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      })),
    })
  }

  const { workspace, role: myRole } = result
  const plan = user?.plan ?? "STARTER"

  const members = workspace.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
  }))

  return NextResponse.json({
    success: true,
    myRole,
    plan,
    limit: TEAM_LIMITS[plan] === Infinity ? Infinity : (TEAM_LIMITS[plan] ?? 1) + extraSeats,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    members,
  })
}

const patchSchema = z.object({
  memberId: z.string(),
  role: z.enum(["ADMIN", "USER"]),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const { memberId, role } = parsed.data

  const result = await getUserWorkspace(session.user.id)
  if (!result) {
    return NextResponse.json({ error: "Workspace no encontrado" }, { status: 404 })
  }

  const { workspace, role: myRole } = result

  if (myRole !== "OWNER" && myRole !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos para cambiar roles" }, { status: 403 })
  }

  const member = await safePrismaQuery(() =>
    prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId: workspace.id },
    })
  )

  if (!member) {
    return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 })
  }

  if (member.role === "OWNER") {
    return NextResponse.json({ error: "No se puede cambiar el rol del propietario" }, { status: 403 })
  }

  const updated = await safePrismaQuery(() =>
    prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: role as TeamRole },
    })
  )

  return NextResponse.json({ success: true, member: updated })
}
