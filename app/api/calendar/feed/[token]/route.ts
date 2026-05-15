export const maxDuration = 30
export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function formatICalDateOnly(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}`
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const user = await prisma.user.findFirst({
    where: { calendarFeedToken: token },
    select: { id: true, name: true },
  })

  if (!user) {
    return new NextResponse("Calendar not found", { status: 404 })
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: { not: null },
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      project: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  })

  const calendarName = `ClientLabs — ${user.name ?? "Tareas"}`
  const now = formatICalDate(new Date())

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClientLabs//Tareas//ES",
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Madrid",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-PUBLISHED-TTL:PT15M",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
  ]

  for (const task of tasks) {
    if (!task.dueDate) continue

    const uid = `task-${task.id}@clientlabs.io`
    const dtstamp = formatICalDate(task.updatedAt ?? task.createdAt)
    const dtstart = formatICalDateOnly(task.dueDate)
    const dtend = formatICalDateOnly(new Date(task.dueDate.getTime() + 86_400_000))

    const icalStatus =
      task.status === "DONE" ? "COMPLETED" :
      task.status === "IN_PROGRESS" ? "IN-PROCESS" : "NEEDS-ACTION"

    const priority =
      task.priority === "URGENT" ? 1 :
      task.priority === "HIGH" ? 3 :
      task.priority === "MEDIUM" ? 5 : 9

    const descParts: string[] = []
    if (task.description) descParts.push(task.description)
    if (task.project) descParts.push(`Proyecto: ${task.project.name}`)
    descParts.push(`Estado: ${task.status}`)
    descParts.push(`Prioridad: ${task.priority}`)

    const summary = task.project
      ? `[${task.project.name}] ${task.title}`
      : task.title

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${escapeICalText(summary)}`,
      `DESCRIPTION:${escapeICalText(descParts.join("\\n"))}`,
      `STATUS:${icalStatus}`,
      `PRIORITY:${priority}`,
      `LAST-MODIFIED:${dtstamp}`,
      "END:VEVENT"
    )
  }

  lines.push("END:VCALENDAR")

  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="clientlabs-tareas.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  })
}
