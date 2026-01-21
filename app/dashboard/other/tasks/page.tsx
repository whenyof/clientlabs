"use client"

import { useMemo, useState } from "react"
import { TasksTable } from "./components/TasksTable"
import { TaskKPIs } from "./components/TaskKPIs"
import { TaskTabs, type TaskTab } from "./components/TaskTabs"
import { TASKS, type TaskItem } from "./components/mock"
import { CreateTaskModal } from "./components/CreateTaskModal"
import { Search } from "lucide-react"

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TaskTab>("todas")
  const [tasks, setTasks] = useState<TaskItem[]>(TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [focusMode, setFocusMode] = useState(false)

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]

    let result = tasks

    switch (activeTab) {
      case "hoy":
        result = result.filter((task) => task.dueDate === today)
        break
      case "alta":
        result = result.filter((task) => task.priority === "high")
        break
      case "automáticas":
        result = result.filter((task) => task.origin === "bot")
        break
    }

    if (focusMode) {
      result = result.filter((t) => t.priority === "high")
    }

    if (query) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    return result
  }, [activeTab, tasks, query, focusMode])

  const handleCreateTask = (task: TaskItem) => {
    setTasks((prev) => [task, ...prev])
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400">
            Productividad
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Centro de Tareas
          </h1>
          <p className="text-sm text-white/60">
            Control total sobre tu operación diaria
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition
              ${focusMode
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/5 text-white/70 hover:bg-white/10"}
            `}
          >
            🔥 Modo foco
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="
              px-4 py-2 bg-purple-600 hover:bg-purple-700
              text-white rounded-lg font-medium transition-colors
            "
          >
            + Nueva tarea
          </button>
        </div>
      </div>

      {/* KPIs */}
      <TaskKPIs tasks={tasks} />

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <TaskTabs active={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-3">

          {/* SEARCH */}
          <div className="
            flex items-center gap-2
            bg-white/5 border border-white/10
            rounded-lg px-3 py-2
          ">
            <Search size={16} className="text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarea..."
              className="
                bg-transparent outline-none text-sm
                text-white placeholder-white/40
              "
            />
          </div>

          <p className="text-sm text-white/60">
            {filteredTasks.length} visibles
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="
        bg-white/5 border border-white/10
        rounded-2xl p-6
      ">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg">No hay tareas aquí 👀</p>
            <p className="text-sm mt-2">
              Prueba otro filtro o crea una nueva tarea
            </p>
          </div>
        ) : (
          <TasksTable tasks={filteredTasks} />
        )}
      </div>

      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  )
}