/**
 * Typed client for the centralized Task API.
 * Use these from UI / server actions instead of Prisma for task operations.
 */

const API_BASE = "/api/tasks"

export type TaskEntityType = "LEAD" | "CLIENT" | "PROVIDER" | "SALE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"
export type TaskStatus = "PENDING" | "DONE" | "CANCELLED"

export type CreateTaskInput = {
  title: string
  description?: string | null
  dueDate?: string | null
  priority?: TaskPriority | null
  assignedToId?: string | null
  entityType?: TaskEntityType | null
  entityId?: string | null
}

export type UpdateTaskInput = {
  title?: string
  description?: string | null
  dueDate?: string | null
  priority?: TaskPriority | null
  assignedToId?: string | null
  status?: TaskStatus | null
  latitude?: number | null
  longitude?: number | null
  routeOrder?: number | null
}

export type TaskListParams = {
  status?: string
  priority?: string
  from?: string
  to?: string
  assignedTo?: string
  entityType?: string
  entityId?: string
}

export type TaskStats = {
  today: number
  overdue: number
  upcoming7d: number
  completed30d: number
  completionRate: number
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Request failed")
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** GET /api/tasks */
export async function fetchTasks(params?: TaskListParams): Promise<unknown[]> {
  const url = new URL(API_BASE, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  return handleResponse<unknown[]>(res)
}

/** POST /api/tasks */
export async function createTask(body: CreateTaskInput): Promise<unknown> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return handleResponse<unknown>(res)
}

/** PATCH /api/tasks/[id] */
export async function updateTask(id: string, body: UpdateTaskInput): Promise<unknown> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return handleResponse<unknown>(res)
}

/** DELETE /api/tasks/[id] */
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" })
  await handleResponse<void>(res)
}

/** POST /api/tasks/[id]/complete */
export async function completeTask(id: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/${id}/complete`, { method: "POST" })
  return handleResponse<unknown>(res)
}

/** POST /api/tasks/[id]/reschedule */
export async function rescheduleTask(id: string, dueDate: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/${id}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dueDate }),
  })
  return handleResponse<unknown>(res)
}

/** GET /api/tasks/stats */
export async function fetchTaskStats(): Promise<TaskStats> {
  const res = await fetch(`${API_BASE}/stats`)
  return handleResponse<TaskStats>(res)
}
