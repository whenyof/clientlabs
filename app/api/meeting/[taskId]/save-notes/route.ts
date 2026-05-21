export const maxDuration = 10

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const schema = z.object({ notes: z.string().max(50000) })

export async function POST(req: Request, props: { params: Promise<{ taskId: string }> }) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const raw = await req.json()
    const parsed = schema.safeParse(raw)
    if (!parsed.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 })

    const task = await prisma.task.findFirst({
      where: { id: params.taskId, userId: session.user.id },
      select: { id: true, leadId: true, title: true },
    })
    if (!task) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })

    await prisma.task.update({
      where: { id: task.id },
      data: { meetingNotes: parsed.data.notes },
    })

    // Guardar como actividad del lead si está vinculado y hay notas
    if (task.leadId && parsed.data.notes.trim()) {
      await prisma.activity.create({
        data: {
          leadId: task.leadId,
          userId: session.user.id,
          type: "MEETING",
          title: `Notas reunión: ${task.title}`,
          description: parsed.data.notes.slice(0, 1000),
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/meeting/[taskId]/save-notes error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
