import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { format, startOfDay, addDays } from "date-fns"

const CAPACITY_MINUTES = 8 * 60
const FALLBACK_ESTIMATE = 30
const EXTEND_BUFFER_PERCENT = 0.2

export type RecommendationType =
  | "reschedule"
  | "reassign"
  | "extend_time"
  | "merge"
  | "priority_change"

export type SuggestedChange =
  | { taskId: string; dueDate?: string; startAt?: string; endAt?: string }
  | { taskId: string; assignedToId: string | null }
  | { taskId: string; estimatedMinutes: number }
  | { taskIds: string[]; suggestedSlot?: { startAt: string; endAt: string } }
  | { taskId: string; priority: "LOW" | "MEDIUM" | "HIGH" }

export type OperationalRecommendation = {
  id: string
  type: RecommendationType
  title: string
  explanation: string
  expectedBenefit: string
  confidence: number
  difficulty: "low" | "medium" | "high"
  suggestedChange: SuggestedChange
  /** Task titles for display */
  affectedTaskTitles?: string[]
}

let recIdCounter = 0
function nextRecId(): string {
  return `rec-${++recIdCounter}-${Date.now()}`
}

/**
 * GET /api/tasks/recommendations?from=&to=
 * Uses predictions + agenda to suggest actionable decisions. Never auto-executes.
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
    const toDate = toParam ? new Date(toParam) : addDays(now, 14)
    const to = startOfDay(toDate)
    const toEndOfDay = new Date(to)
    toEndOfDay.setHours(23, 59, 59, 999)

    const origin = request.nextUrl.origin
    const predUrl = `${origin}/api/tasks/predictions?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(toEndOfDay.toISOString())}`
    const [predictionsRes, pending, completedByAssignee] = await Promise.all([
      fetch(predUrl, { headers: { cookie: request.headers.get("cookie") ?? "" } }),
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
          startAt: true,
          endAt: true,
          estimatedMinutes: true,
          type: true,
          assignedTo: true,
          priority: true,
        },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: "DONE",
          completedAt: { not: null },
          assignedTo: { not: null },
        },
        select: {
          type: true,
          assignedTo: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          estimatedMinutes: true,
        },
      }),
    ])

    let predictions: Array<{
      type: string
      impactLevel: string
      affectedTasks: { id: string; title: string }[]
      probability?: number
    }> = []
    if (predictionsRes.ok) {
      const data = await predictionsRes.json()
      predictions = Array.isArray(data.predictions) ? data.predictions : []
    }

    const recommendations: OperationalRecommendation[] = []

    const avgRealByType = new Map<string, number[]>()
    for (const t of completedByAssignee) {
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

    const assigneeAvgByType = new Map<string, number[]>()
    for (const t of completedByAssignee) {
      const end = t.completedAt!
      const start = t.startedAt ?? t.createdAt
      const min = (end.getTime() - start.getTime()) / (60 * 1000)
      if (min < 0 || !t.assignedTo) continue
      const key = `${t.assignedTo}|${t.type}`
      if (!assigneeAvgByType.has(key)) assigneeAvgByType.set(key, [])
      assigneeAvgByType.get(key)!.push(min)
    }
    const avgByAssigneeAndType = new Map<string, number>()
    for (const [key, arr] of assigneeAvgByType) {
      if (arr.length === 0) continue
      avgByAssigneeAndType.set(key, arr.reduce((a, b) => a + b, 0) / arr.length)
    }

    for (const pred of predictions) {
      if (pred.affectedTasks.length === 0) continue

      if (
        (pred.type === "DELAY_PROBABILITY" || pred.type === "TYPE_OVERRUN") &&
        pred.impactLevel === "high"
      ) {
        for (const task of pred.affectedTasks.slice(0, 5)) {
          const t = pending.find((p) => p.id === task.id)
          if (!t || !t.dueDate) continue
          const est = t.estimatedMinutes ?? avgByType.get(t.type) ?? FALLBACK_ESTIMATE
          const avg = avgByType.get(t.type)
          if (!avg || avg <= est) continue
          const suggested = Math.ceil(avg * (1 + EXTEND_BUFFER_PERCENT))
          if (suggested <= est) continue
          recommendations.push({
            id: nextRecId(),
            type: "extend_time",
            title: "Ampliar tiempo estimado",
            explanation: `"${task.title}" suele durar más que lo estimado (histórico por tipo). Aumentar la estimación reduce el riesgo de retraso.`,
            expectedBenefit: "Mejor puntualidad y cumplimiento de plazos",
            confidence: 0.8,
            difficulty: "low",
            suggestedChange: { taskId: task.id, estimatedMinutes: suggested },
            affectedTaskTitles: [task.title],
          })
        }
      }

      if (pred.type === "DEADLINE_BREACH" && pred.affectedTasks.length > 0) {
        const task = pred.affectedTasks[0]
        const t = pending.find((p) => p.id === task.id)
        if (t) {
          recommendations.push({
            id: nextRecId(),
            type: "priority_change",
            title: "Subir prioridad para cumplir plazo",
            explanation: `"${task.title}" vence pronto y tiene riesgo de retraso. Darle prioridad alta ayuda a asegurar su cumplimiento.`,
            expectedBenefit: "Mayor probabilidad de cumplir el plazo",
            confidence: 0.75,
            difficulty: "low",
            suggestedChange: { taskId: task.id, priority: "HIGH" },
            affectedTaskTitles: [task.title],
          })
        }
      }

      if (pred.type === "DAY_SATURATION") {
        const ids = pred.affectedTasks.map((a) => a.id)
        const tasks = pending.filter((p) => ids.includes(p.id))
        const dayKey = tasks[0]?.dueDate ? format(startOfDay(tasks[0].dueDate), "yyyy-MM-dd") : ""
        const total = tasks.reduce(
          (acc, p) => acc + (p.estimatedMinutes ?? avgByType.get(p.type) ?? FALLBACK_ESTIMATE),
          0
        )
        const excess = total - CAPACITY_MINUTES
        if (excess > 0 && tasks.length > 0) {
          const toMove = tasks.sort(
            (a, b) =>
              (a.priority === "HIGH" ? 1 : 0) - (b.priority === "HIGH" ? 1 : 0) ||
              (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0)
          )[0]
          const nextDay = addDays(toMove.dueDate!, 1)
          nextDay.setHours(9, 0, 0, 0)
          recommendations.push({
            id: nextRecId(),
            type: "reschedule",
            title: "Mover tarea para reducir saturación",
            explanation: `El ${dayKey} hay sobrecarga (${Math.round(excess)} min por encima de capacidad). Mover "${toMove.title}" al día siguiente alivia el día.`,
            expectedBenefit: "Mejor uso del tiempo y menos riesgo de retraso",
            confidence: 0.85,
            difficulty: "medium",
            suggestedChange: {
              taskId: toMove.id,
              dueDate: nextDay.toISOString(),
              startAt: nextDay.toISOString(),
              endAt: new Date(nextDay.getTime() + (toMove.estimatedMinutes ?? 60) * 60 * 1000).toISOString(),
            },
            affectedTaskTitles: [toMove.title],
          })
        }
      }
    }

    for (const t of pending) {
      if (!t.assignedTo || !t.type) continue
      const currentKey = `${t.assignedTo}|${t.type}`
      const currentAvg = avgByAssigneeAndType.get(currentKey)
      if (currentAvg == null) continue
      let bestAssignee: string | null = null
      let bestAvg = currentAvg
      const assignees = new Set(completedByAssignee.map((x) => x.assignedTo).filter(Boolean)) as Set<string>
      for (const a of assignees) {
        if (a === t.assignedTo) continue
        const key = `${a}|${t.type}`
        const avg = avgByAssigneeAndType.get(key)
        if (avg != null && avg < bestAvg * 0.85) {
          bestAvg = avg
          bestAssignee = a
        }
      }
      if (bestAssignee) {
        recommendations.push({
          id: nextRecId(),
          type: "reassign",
          title: "Reasignar a quien rinde mejor en este tipo",
          explanation: `"${t.title}" está asignada a alguien que históricamente tarda más en tareas tipo "${t.type}". Otro responsable suele completarlas más rápido.`,
          expectedBenefit: "Menor tiempo real y mejor productividad",
          confidence: 0.7,
          difficulty: "medium",
          suggestedChange: { taskId: t.id, assignedToId: bestAssignee },
          affectedTaskTitles: [t.title],
        })
      }
    }

    const byDay = new Map<string, typeof pending>()
    for (const t of pending) {
      if (!t.dueDate) continue
      const dayKey = format(startOfDay(t.dueDate), "yyyy-MM-dd")
      if (!byDay.has(dayKey)) byDay.set(dayKey, [])
      byDay.get(dayKey)!.push(t)
    }
    for (const [, dayTasks] of byDay) {
      if (dayTasks.length < 2) continue
      const withClient = dayTasks.filter((t) => t.type)
      const byType = new Map<string, typeof dayTasks>()
      for (const t of withClient) {
        if (!byType.has(t.type)) byType.set(t.type, [])
        byType.get(t.type)!.push(t)
      }
      for (const [, group] of byType) {
        if (group.length < 2) continue
        const sorted = [...group].sort(
          (a, b) => (a.startAt?.getTime() ?? 0) - (b.startAt?.getTime() ?? 0)
        )
        recommendations.push({
          id: nextRecId(),
          type: "merge",
          title: "Compactar tareas del mismo tipo",
          explanation: `${sorted.length} tareas tipo "${sorted[0].type}" el mismo día. Agruparlas en un bloque consecutivo reduce cambios de contexto.`,
          expectedBenefit: "Mejor uso del tiempo y menos transiciones",
          confidence: 0.65,
          difficulty: "high",
          suggestedChange: { taskIds: sorted.map((s) => s.id) },
          affectedTaskTitles: sorted.map((s) => s.title),
        })
      }
    }

    recommendations.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      recommendations: recommendations.slice(0, 15),
    })
  } catch (error) {
    console.error("[GET /api/tasks/recommendations]:", error)
    return NextResponse.json(
      { error: "Failed to compute recommendations" },
      { status: 500 }
    )
  }
}
