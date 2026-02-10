import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { format, addDays, startOfDay } from "date-fns"

const CAPACITY_MINUTES = 8 * 60
const LOOKAHEAD_DAYS = 14
const FALLBACK_ESTIMATE = 30
const RATIO_RISK_THRESHOLD = 1.2
const CLIENT_CANCELLATION_RISK_COUNT = 2

export type PredictionType =
  | "DELAY_PROBABILITY"
  | "DAY_SATURATION"
  | "CLIENT_RISK"
  | "TYPE_OVERRUN"
  | "DEADLINE_BREACH"

export type ImpactLevel = "low" | "medium" | "high"

export type AffectedTask = { id: string; title: string }

export type OperationalPrediction = {
  type: PredictionType
  title: string
  description: string
  probability: number
  impactLevel: ImpactLevel
  affectedTasks: AffectedTask[]
}

function toImpact(probability: number): ImpactLevel {
  if (probability >= 0.7) return "high"
  if (probability >= 0.4) return "medium"
  return "low"
}

/**
 * GET /api/tasks/predictions?from=&to=
 * Returns operational predictions (delay risk, saturation, client risk, type overrun, deadline breach).
 * Mathematical patterns only. Does not modify data.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const now = startOfDay(new Date())
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const from = fromParam ? startOfDay(new Date(fromParam)) : now
    const toDate = toParam ? new Date(toParam) : addDays(now, LOOKAHEAD_DAYS)
    const to = startOfDay(toDate)
    const toEndOfDay = new Date(to)
    toEndOfDay.setHours(23, 59, 59, 999)

    const [completed, pending, cancelledByClient] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: "DONE",
          completedAt: { not: null },
        },
        select: {
          type: true,
          estimatedMinutes: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: "PENDING",
          dueDate: { gte: from, lte: toEndOfDay },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          type: true,
          estimatedMinutes: true,
          clientId: true,
          assignedTo: true,
        },
      }),
      prisma.task.groupBy({
        by: ["clientId"],
        where: {
          userId,
          status: "CANCELLED",
          clientId: { not: null },
        },
        _count: { id: true },
      }),
    ])

    const predictions: OperationalPrediction[] = []

    const avgRealByType = new Map<string, number[]>()
    for (const t of completed) {
      const end = t.completedAt!
      const start = t.startedAt ?? t.createdAt
      const min = (end.getTime() - start.getTime()) / (60 * 1000)
      if (min < 0) continue
      if (!avgRealByType.has(t.type)) avgRealByType.set(t.type, [])
      avgRealByType.get(t.type)!.push(min)
    }
    const avgByType = new Map<string, number>()
    for (const [type, arr] of avgRealByType) {
      if (arr.length === 0) continue
      avgByType.set(type, arr.reduce((a, b) => a + b, 0) / arr.length)
    }

    const toAffectedTasks = (ids: string[]): AffectedTask[] =>
      pending.filter((t) => ids.includes(t.id)).map((t) => ({ id: t.id, title: t.title }))

    const ratioByType = new Map<string, number>()
    for (const t of completed) {
      const est = t.estimatedMinutes ?? FALLBACK_ESTIMATE
      const avg = avgByType.get(t.type)
      if (!avg) continue
      const ratio = avg / est
      if (!ratioByType.has(t.type) || ratio > (ratioByType.get(t.type) ?? 0)) {
        ratioByType.set(t.type, ratio)
      }
    }
    for (const [type, ratio] of ratioByType) {
      if (ratio < RATIO_RISK_THRESHOLD) continue
      const ids = pending.filter((t) => t.type === type).map((t) => t.id)
      if (ids.length === 0) continue
      predictions.push({
        type: "TYPE_OVERRUN",
        title: "Tipo de trabajo que suele alargarse",
        description: `Las tareas tipo "${type}" han durado de media un ${Math.round((ratio - 1) * 100)}% más que lo estimado. Considera buffer en las ${ids.length} tareas pendientes.`,
        probability: Math.min(1, (ratio - 1) * 0.5 + 0.5),
        impactLevel: toImpact(Math.min(1, ratio - 0.5)),
        affectedTasks: toAffectedTasks(ids),
      })
    }

    const totalByDay = new Map<string, number>()
    const taskIdsByDay = new Map<string, string[]>()
    for (const t of pending) {
      if (!t.dueDate) continue
      const dayKey = format(startOfDay(t.dueDate), "yyyy-MM-dd")
      const est = t.estimatedMinutes ?? avgByType.get(t.type) ?? FALLBACK_ESTIMATE
      totalByDay.set(dayKey, (totalByDay.get(dayKey) ?? 0) + est)
      if (!taskIdsByDay.has(dayKey)) taskIdsByDay.set(dayKey, [])
      taskIdsByDay.get(dayKey)!.push(t.id)
    }
    for (const [dayKey, total] of totalByDay) {
      if (total <= CAPACITY_MINUTES) continue
      const ratio = total / CAPACITY_MINUTES
      const probability = Math.min(1, 0.5 + (ratio - 1) * 0.5)
      const ids = taskIdsByDay.get(dayKey) ?? []
      predictions.push({
        type: "DAY_SATURATION",
        title: "Día con riesgo de saturación",
        description: `El ${dayKey} hay ${Math.round(total)} min asignados (capacidad ${CAPACITY_MINUTES} min). Probabilidad de retraso: ${(probability * 100).toFixed(0)}%.`,
        probability: Math.round(probability * 100) / 100,
        impactLevel: toImpact(probability),
        affectedTasks: toAffectedTasks(ids),
      })
    }

    const clientRiskIds = new Set(
      cancelledByClient
        .filter((g) => g.clientId && g._count.id >= CLIENT_CANCELLATION_RISK_COUNT)
        .map((g) => g.clientId!)
    )
    if (clientRiskIds.size > 0) {
      const ids = pending.filter((t) => t.clientId && clientRiskIds.has(t.clientId)).map((t) => t.id)
      if (ids.length > 0) {
        predictions.push({
          type: "CLIENT_RISK",
          title: "Clientes con historial problemático",
          description: `${clientRiskIds.size} cliente(s) con ${CLIENT_CANCELLATION_RISK_COUNT}+ tareas canceladas. ${ids.length} tarea(s) pendientes asociadas.`,
          probability: 0.6,
          impactLevel: "medium",
          affectedTasks: toAffectedTasks(ids),
        })
      }
    }

    const nowMs = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    for (const t of pending) {
      if (!t.dueDate) continue
      const est = t.estimatedMinutes ?? avgByType.get(t.type) ?? FALLBACK_ESTIMATE
      const avg = avgByType.get(t.type)
      const ratio = avg ? avg / est : 1
      const delayProb = ratio >= RATIO_RISK_THRESHOLD ? Math.min(1, 0.4 + (ratio - 1) * 0.5) : 0.2
      const dueIn = t.dueDate.getTime() - nowMs
      if (dueIn > 0 && dueIn <= 2 * oneDayMs && delayProb >= 0.5) {
        predictions.push({
          type: "DEADLINE_BREACH",
          title: "Riesgo de incumplimiento de plazo",
          description: `"${t.title}" vence pronto y el historial de este tipo de tarea suele superar la estimación.`,
          probability: Math.round(delayProb * 100) / 100,
          impactLevel: toImpact(delayProb),
          affectedTasks: toAffectedTasks([t.id]),
        })
      }
    }

    const taskDelayProbs: { taskId: string; probability: number }[] = []
    for (const t of pending) {
      const est = t.estimatedMinutes ?? avgByType.get(t.type) ?? FALLBACK_ESTIMATE
      const avg = avgByType.get(t.type)
      if (!avg || est <= 0) continue
      const ratio = avg / est
      if (ratio < RATIO_RISK_THRESHOLD) continue
      const probability = Math.min(1, 0.3 + (ratio - 1) * 0.4)
      taskDelayProbs.push({ taskId: t.id, probability })
    }
    const highDelayTasks = taskDelayProbs.filter((p) => p.probability >= 0.5)
    if (highDelayTasks.length > 0) {
      predictions.push({
        type: "DELAY_PROBABILITY",
        title: "Probabilidad de retraso por tarea",
        description: `${highDelayTasks.length} tarea(s) con alta probabilidad de retraso según duración real media vs estimación (histórico por tipo).`,
        probability: highDelayTasks.reduce((a, p) => a + p.probability, 0) / highDelayTasks.length,
        impactLevel: "high",
        affectedTasks: toAffectedTasks(highDelayTasks.map((p) => p.taskId)),
      })
    }

    predictions.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      if (order[a.impactLevel] !== order[b.impactLevel]) return order[a.impactLevel] - order[b.impactLevel]
      return b.probability - a.probability
    })

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error("[GET /api/tasks/predictions]:", error)
    return NextResponse.json(
      { error: "Failed to compute predictions" },
      { status: 500 }
    )
  }
}
