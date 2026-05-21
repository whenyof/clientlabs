export const maxDuration = 10

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { MeetingView } from "./MeetingView"

export default async function MeetingPage({ params }: { params: Promise<{ taskId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const { taskId } = await params

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
    select: {
      id: true,
      title: true,
      description: true,
      meetingUrl: true,
      meetingType: true,
      meetingNotes: true,
      clientId: true,
      leadId: true,
      project: { select: { id: true, name: true, color: true } },
      assignees: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  if (!task) redirect("/dashboard/tasks")
  if (!task.meetingUrl) redirect("/dashboard/tasks")

  let entityData: Record<string, unknown> | null = null
  let entityType: "client" | "lead" | null = null

  if (task.clientId) {
    entityType = "client"
    const client = await prisma.client.findUnique({
      where: { id: task.clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        companyName: true,
        totalSpent: true,
        Invoice: {
          where: { status: { in: ["SENT", "OVERDUE"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, number: true, total: true, status: true },
        },
        quotes: {
          where: { status: "SENT" },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, number: true, total: true },
        },
      },
    })
    if (client) entityData = client as unknown as Record<string, unknown>
  } else if (task.leadId) {
    entityType = "lead"
    const lead = await prisma.lead.findUnique({
      where: { id: task.leadId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        notes: true,
        country: true,
        score: true,
        temperature: true,
        contacts: {
          orderBy: { isPrimary: "desc" },
          take: 5,
          select: { id: true, name: true, role: true, email: true, phone: true, isPrimary: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: { id: true, title: true, description: true, createdAt: true, type: true },
        },
      },
    })
    if (lead) entityData = lead as unknown as Record<string, unknown>
  }

  return (
    <MeetingView
      task={task as Parameters<typeof MeetingView>[0]["task"]}
      entityData={entityData}
      entityType={entityType}
    />
  )
}
