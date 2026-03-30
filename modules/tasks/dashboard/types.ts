export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"
export type TaskStatus = "PENDING" | "DONE" | "CANCELLED"

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
  HIGH: {
    label: "Urgente",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
    soft: "#FEF2F210",
  },
  MEDIUM: {
    label: "Alta",
    color: "#D9A441",
    bg: "#FFFBEB",
    border: "#FDE68A",
    soft: "#FFFBEB10",
  },
  LOW: {
    label: "Normal",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    soft: "#EFF6FF10",
  },
} as const
