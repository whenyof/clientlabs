"use client"

export type TaskPriority = "high" | "medium" | "low"
export type TaskStatus = "pending" | "in_progress" | "completed"
export type TaskOrigin = "manual" | "bot"

export interface TaskItem {
  id: number
  title: string
  client: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: string
  origin: TaskOrigin
}

export const TASKS: TaskItem[] = [
  {
    id: 1,
    title: "Llamar a cliente potencial",
    client: "Luz & Asociados",
    priority: "high",
    status: "pending",
    dueDate: "2026-01-19",
    createdAt: "2026-01-18",
    origin: "manual",
  },
  {
    id: 2,
    title: "Preparar informe mensual",
    client: "Moderno Retail",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-01-20",
    createdAt: "2026-01-16",
    origin: "bot",
  },
  {
    id: 3,
    title: "Actualizar base de datos",
    client: "Studio Fenix",
    priority: "low",
    status: "completed",
    dueDate: "2026-01-22",
    createdAt: "2026-01-14",
    origin: "manual",
  },
  {
    id: 4,
    title: "Revisar facturas pendientes",
    client: "Orbit Finance",
    priority: "high",
    status: "pending",
    dueDate: "2026-01-19",
    createdAt: "2026-01-18",
    origin: "bot",
  },
  {
    id: 5,
    title: "Planificar campaña marketing",
    client: "Café Nimbus",
    priority: "medium",
    status: "pending",
    dueDate: "2026-01-21",
    createdAt: "2026-01-17",
    origin: "manual",
  },
  {
    id: 6,
    title: "Preparar onboarding nuevo cliente",
    client: "Nodespace Labs",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-01-20",
    createdAt: "2026-01-19",
    origin: "bot",
  },
]

// TODO: Reemplazar mocks con API /api/tasks/automation y webhooks internos.
