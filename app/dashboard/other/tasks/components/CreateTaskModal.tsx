"use client"

import { useState } from "react"
import type { TaskItem, TaskPriority, TaskStatus } from "./mock"

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreate: (task: TaskItem) => void
}

const PRIORITIES: TaskPriority[] = ["high", "medium", "low"]
const STATUSES: TaskStatus[] = ["pending", "in_progress", "completed"]
const TYPES = ["manual", "auto"] as const

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
}

export function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps) {
  const [titulo, setTitulo] = useState("")
  const [cliente, setCliente] = useState("")
  const [prioridad, setPrioridad] = useState<TaskPriority>("medium")
  const [fecha, setFecha] = useState("")
  const [estado, setEstado] = useState<TaskStatus>("pending")
  const [asignado, setAsignado] = useState("")
  const [tipo, setTipo] = useState<(typeof TYPES)[number]>("manual")

  if (!open) return null

  const handleSubmit = () => {
    if (!titulo || !cliente || !fecha) return
    const task: TaskItem = {
      id: Date.now(),
      title: titulo,
      client: cliente,
      priority: prioridad,
      status: estado,
      dueDate: fecha,
      createdAt: new Date().toISOString().split("T")[0],
      origin: tipo === "auto" ? "bot" : "manual",
    }
    onCreate(task)
    setTitulo("")
    setCliente("")
    setPrioridad("medium")
    setFecha("")
    setEstado("pending")
    setAsignado("")
    setTipo("manual")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B0D1A]/90 p-6 shadow-2xl text-white">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Nueva tarea</p>
            <h2 className="text-2xl font-semibold">Registro manual</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-white/60 md:col-span-2">
            Título
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Cliente
            <input
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Asignado
            <input
              value={asignado}
              onChange={(event) => setAsignado(event.target.value)}
              placeholder="Ej: Ana López"
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Prioridad
            <select
              value={prioridad}
              onChange={(event) => setPrioridad(event.target.value as TaskPriority)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Fecha
            <input
              type="date"
              value={fecha}
              onChange={(event) => setFecha(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Estado
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as TaskStatus)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-white/60">
            Tipo
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as (typeof TYPES)[number])}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/50 transition hover:border-white/40"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl transition hover:brightness-110"
          >
            Guardar tarea
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTaskModal
