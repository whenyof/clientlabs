import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskList } from "@/modules/tasks/components/TaskList"
import { TaskFilters } from "@/modules/tasks/components/TaskFilters"
import { TaskDialog } from "@/modules/tasks/components/TaskDialog"
import { getSectorConfigByPath } from "@/config/sectors"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Prisma } from "@prisma/client"
import { AddTaskButton } from "./AddTaskButton"

export default async function TasksPage({
    searchParams,
}: {
    searchParams: { view?: string; search?: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    const view = searchParams.view || "today"
    const search = searchParams.search || ""

    // Build Where Clause
    const where: Prisma.TaskWhereInput = {
        userId: session.user.id,
        title: { contains: search, mode: "insensitive" },
    }

    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const endOfDay = new Date(now.setHours(23, 59, 59, 999))

    // View Filters
    if (view === "today") {
        where.dueDate = {
            gte: startOfDay,
            lte: endOfDay
        }
    } else if (view === "week") {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        where.dueDate = {
            gte: startOfDay,
            lte: nextWeek
        }
    } else if (view === "overdue") {
        where.dueDate = {
            lt: startOfDay
        }
        where.status = "PENDING"
    }
    // "all" does not add extra date filters (besides search)

    const tasks = await prisma.task.findMany({
        where,
        orderBy: [
            { status: "asc" }, // Pending first
            { dueDate: "asc" }, // Earliest due first
            { priority: "desc" }, // High priority first
        ],
        include: {
            Client: { select: { name: true } },
            Lead: { select: { name: true } }
        }
    })

    // Map to simplified Task type for UI
    const formattedTasks = tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.type,
        dueDate: t.dueDate,
        clientId: t.clientId || undefined,
        clientName: t.Client?.name || undefined,
        leadId: t.leadId || undefined,
        leadName: t.Lead?.name || undefined,
        createdAt: t.createdAt
    }))

    const config = getSectorConfigByPath('/dashboard/tasks')
    const { labels } = config

    return (
        <div className="h-full flex flex-col p-6 space-y-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{labels.tasks.title}</h1>
                    <p className="text-white/60">{labels.tasks.pageSubtitle}</p>
                </div>
                <AddTaskButton />
            </div>

            {/* Filters */}
            <TaskFilters />

            {/* Task List */}
            <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="text-white/40">{labels.tasks.ui.loadingTasks}</div>}>
                    <TaskList tasks={formattedTasks} />
                </Suspense>
            </div>
        </div>
    )
}
