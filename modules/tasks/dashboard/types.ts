export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED"

export interface DashboardTask {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  startAt: string | null
  endAt: string | null
  createdAt: string
  updatedAt: string
  clientId: string | null
  leadId: string | null
  Client: { id: string; name: string } | null
  Lead: { id: string; name: string } | null
}

export interface TasksKPIsData {
  pending: number
  completed: number
  urgent: number
  completionRate: number
  overdue: number
}

export type ViewMode = "priority" | "week" | "month"

export const PRIORITY_CONFIG = {
  URGENT: {
    label: "Urgente",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
    soft: "#FEF2F210",
  },
  HIGH: {
    label: "Alta",
    color: "#F97316",
    bg: "#FFF7ED",
    border: "#FDBA74",
    soft: "#FFF7ED10",
  },
  MEDIUM: {
    label: "Media",
    color: "#EAB308",
    bg: "#FEFCE8",
    border: "#FDE68A",
    soft: "#FEFCE810",
  },
  LOW: {
    label: "Baja",
    color: "#94A3B8",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    soft: "#F8FAFC10",
  },
} as const
