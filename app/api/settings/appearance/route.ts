export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { DEFAULT_PREFERENCES } from "@/lib/types/ui-preferences"

const DEFAULT_PREFS = DEFAULT_PREFERENCES

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { uiPreferences: true },
    })
  )

  const prefs = user?.uiPreferences
    ? { ...DEFAULT_PREFS, ...(user.uiPreferences as object) }
    : DEFAULT_PREFS

  return NextResponse.json({ success: true, prefs })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { uiPreferences: true },
    })
  )

  const existing = (user?.uiPreferences as Record<string, unknown>) ?? {}
  // Dark mode not yet available — force light theme
  if (body.theme === "dark" || body.theme === "system") body.theme = "light"
  const merged = { ...DEFAULT_PREFS, ...existing, ...body }

  await safePrismaQuery(() =>
    prisma.user.update({
      where: { id: session.user.id },
      data: { uiPreferences: merged },
    })
  )

  return NextResponse.json({ success: true, prefs: merged })
}
