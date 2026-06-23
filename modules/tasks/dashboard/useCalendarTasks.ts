"use client"

import { useQuery } from "@tanstack/react-query"
import type { DashboardTask } from "./types"

/**
 * Carga SOLO las tareas del rango visible del calendario (día/semana/mes).
 * Reutiliza GET /api/tasks?from&to (filtra por dueDate OR startAt en rango).
 * La clave incluye el rango → al navegar refetchea el nuevo rango.
 */
export function calendarTasksKey(viewId: string, fromISO: string, toISO: string) {
  return ["tasks", "cal", viewId, fromISO, toISO] as const
}

export function useCalendarTasks(viewId: string, fromISO: string, toISO: string) {
  return useQuery<DashboardTask[]>({
    queryKey: calendarTasksKey(viewId, fromISO, toISO),
    queryFn: async () => {
      const res = await fetch(`/api/tasks?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`)
      if (!res.ok) throw new Error("Failed to fetch calendar tasks")
      return res.json()
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })
}
