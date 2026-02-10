/**
 * Server-side task API client.
 * Use from Server Actions to create/update tasks via the centralized API.
 * Forwards cookies so the API authenticates the current user.
 */

import { cookies } from "next/headers"

export type TaskEntityType = "LEAD" | "CLIENT" | "PROVIDER" | "SALE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"

export type CreateTaskPayload = {
  title: string
  description?: string | null
  dueDate?: string | null
  startAt?: string | null
  endAt?: string | null
  estimatedMinutes?: number | null
  priority?: TaskPriority | null
  assignedToId?: string | null
  entityType?: TaskEntityType | null
  entityId?: string | null
}

export type UpdateTaskPayload = {
  title?: string
  description?: string | null
  dueDate?: string | Date | null
  startAt?: string | Date | null
  endAt?: string | Date | null
  priority?: TaskPriority | null
  assignedToId?: string | null
  status?: "PENDING" | "DONE" | "CANCELLED" | null
  completedAt?: string | Date | null
  type?: "CALL" | "EMAIL" | "MEETING" | "MANUAL" | null
  estimatedMinutes?: number | null
}

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

async function getHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const cookie = cookieStore.toString()
  return {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  }
}

/**
 * Create a task via POST /api/tasks.
 * Returns the created task or throws on error.
 */
export async function createTask(payload: CreateTaskPayload): Promise<{ id: string; [key: string]: unknown }> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Failed to create task")
  }
  return res.json() as Promise<{ id: string; [key: string]: unknown }>
}

async function apiFetch(
  path: string,
  options: { method: string; body?: string } = { method: "GET" }
): Promise<Response> {
  const baseUrl = getBaseUrl()
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: await getHeaders(),
    ...(options.body ? { body: options.body } : {}),
  })
}

/**
 * Update a task via PATCH /api/tasks/[id].
 */
export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<{ id: string; [key: string]: unknown }> {
  const body: Record<string, unknown> = { ...payload }
  if (payload.dueDate instanceof Date) body.dueDate = payload.dueDate.toISOString()
  if (payload.startAt instanceof Date) body.startAt = payload.startAt.toISOString()
  if (payload.endAt instanceof Date) body.endAt = payload.endAt.toISOString()
  if (payload.completedAt instanceof Date) body.completedAt = payload.completedAt.toISOString()
  const res = await apiFetch(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Failed to update task")
  }
  return res.json() as Promise<{ id: string; [key: string]: unknown }>
}

/**
 * Complete a task via POST /api/tasks/[id]/complete.
 */
export async function completeTask(id: string): Promise<{ id: string; [key: string]: unknown }> {
  const res = await apiFetch(`/api/tasks/${id}/complete`, { method: "POST" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Failed to complete task")
  }
  return res.json() as Promise<{ id: string; [key: string]: unknown }>
}

/**
 * Get a single task via GET /api/tasks/[id].
 */
export async function getTask(
  id: string
): Promise<{ id: string; clientId?: string | null; [key: string]: unknown }> {
  const res = await apiFetch(`/api/tasks/${id}`, { method: "GET" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Task not found")
  }
  return res.json() as Promise<{ id: string; clientId?: string | null; [key: string]: unknown }>
}

/**
 * Delete a task via DELETE /api/tasks/[id].
 */
export async function deleteTask(id: string): Promise<void> {
  const res = await apiFetch(`/api/tasks/${id}`, { method: "DELETE" })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? "Failed to delete task")
  }
}
