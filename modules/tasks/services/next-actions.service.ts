import { prisma } from "@/lib/prisma"

const MS_24H = 24 * 60 * 60 * 1000
const MS_72H = 72 * 60 * 60 * 1000
const LOOKAHEAD_MS = 7 * 24 * 60 * 60 * 1000

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

/** Urgency: today/overdue = 50, < 24h = 35, < 72h = 20, else 10, no date = 0 */
function urgencyScore(dueDate: Date | null, now: Date): number {
  if (!dueDate) return 0
  const due = dueDate.getTime()
  const endToday = endOfToday().getTime()
  if (due <= endToday) return 50
  const diff = due - now.getTime()
  if (diff <= MS_24H) return 35
  if (diff <= MS_72H) return 20
  return 10
}

function revenueScore(sourceModule: string | null, clientIsVip: boolean): number {
  if (sourceModule === "SALE") return 25
  if (clientIsVip) return 15
  return 0
}

export type NextActionTask = {
  id: string
  title: string
  dueDate: string | null
  startAt: string | null
  estimatedMinutes: number | null
  priorityScore: number | null
  status: string
  sourceModule: string | null
  clientName: string | null
}

/**
 * Best next action: sort by (priority + urgency + revenue), then shorter duration first.
 * Returns top 5 pending tasks.
 */
export async function getNextActions(userId: string): Promise<NextActionTask[]> {
  const now = new Date()
  const rangeEnd = new Date(now.getTime() + LOOKAHEAD_MS)
  rangeEnd.setHours(23, 59, 59, 999)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: "PENDING",
      OR: [
        { dueDate: { gte: now, lte: rangeEnd } },
        { dueDate: { lte: endOfToday() } },
        { dueDate: null },
      ],
    },
    include: {
      Client: { select: { id: true, name: true, totalSpent: true, finalScore: true } },
    },
  })

  const scored = tasks.map((t) => {
    const due = t.dueDate
    const priority = t.priorityScore != null && Number.isFinite(t.priorityScore) ? t.priorityScore : 0
    const urgency = urgencyScore(due, now)
    const clientIsVip = Boolean(
      t.Client && (Number(t.Client.totalSpent) > 1000 || Number(t.Client.finalScore) >= 50)
    )
    const revenue = revenueScore(t.sourceModule, clientIsVip)
    const duration = t.estimatedMinutes ?? 30
    const value = priority + urgency + revenue
    return {
      task: t,
      value,
      duration,
    }
  })

  scored.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value
    return a.duration - b.duration
  })

  const top5 = scored.slice(0, 5)

  return top5.map(({ task }) => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate?.toISOString() ?? null,
    startAt: task.startAt?.toISOString() ?? null,
    estimatedMinutes: task.estimatedMinutes,
    priorityScore: task.priorityScore,
    status: task.status,
    sourceModule: task.sourceModule,
    clientName: task.Client?.name ?? null,
  }))
}
