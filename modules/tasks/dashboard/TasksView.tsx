"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { DashboardTask, TaskPriority, ViewMode } from "./types"
import { TasksKPIs } from "./TasksKPIs"
import { TasksTopbar } from "./TasksTopbar"
import { PriorityView } from "./PriorityView"
import { KanbanView } from "./KanbanView"
import { WeekView } from "./WeekView"
import { MonthView } from "./MonthView"
import { TasksSidebarRight } from "./TasksSidebarRight"
import { NewTaskModal } from "./NewTaskModal"

export function TasksView() {
  const [view, setView] = useState<ViewMode>("priority")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("MEDIUM")
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined)
  const [defaultDueTime, setDefaultDueTime] = useState<string | undefined>(undefined)
  const [editTask, setEditTask] = useState<DashboardTask | undefined>(undefined)

  const { data: tasks = [] } = useQuery<DashboardTask[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json()
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  const handleAddTask = (priority: TaskPriority) => {
    setDefaultPriority(priority)
    setDefaultDueDate(undefined)
    setDefaultDueTime(undefined)
    setModalOpen(true)
  }

  const handleNewTask = () => {
    setDefaultPriority("MEDIUM")
    setDefaultDueDate(undefined)
    setDefaultDueTime(undefined)
    setModalOpen(true)
  }

  const handleTaskClick = (task: DashboardTask) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleDayClick = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    setDefaultPriority("MEDIUM")
    setDefaultDueDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`)
    setDefaultDueTime(date.getHours() > 0 ? `${pad(date.getHours())}:00` : undefined)
    setModalOpen(true)
  }

  return (
    <div>
      {/* Topbar */}
      <TasksTopbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        onNewTask={handleNewTask}
      />

      {/* KPIs */}
      <div style={{ marginBottom: 20 }}>
        <TasksKPIs />
      </div>

      {/* Main layout: content + sidebar */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {view === "priority" && (
            <PriorityView tasks={tasks} search={search} onAddTask={handleAddTask} />
          )}
          {view === "kanban" && (
            <KanbanView tasks={tasks} search={search} onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
          )}
          {view === "week" && (
            <WeekView tasks={tasks} onTaskClick={handleTaskClick} onCellClick={handleDayClick} />
          )}
          {view === "month" && (
            <MonthView tasks={tasks} onDayClick={handleDayClick} onTaskClick={handleTaskClick} />
          )}
        </div>

        {/* Right sidebar */}
        <div style={{
          width: 260,
          flexShrink: 0,
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-subtle)",
          borderRadius: 12,
          overflow: "hidden",
          position: "sticky",
          top: 24,
        }}>
          <TasksSidebarRight tasks={tasks} />
        </div>
      </div>

      {/* New task modal */}
      <NewTaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(undefined) }}
        defaultPriority={defaultPriority}
        defaultDueDate={defaultDueDate}
        defaultDueTime={defaultDueTime}
        editTask={editTask}
      />
    </div>
  )
}
