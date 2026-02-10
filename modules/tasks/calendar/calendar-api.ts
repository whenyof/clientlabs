/**
 * PATCH /api/tasks/[id] for calendar updates (start, end, assignee).
 * Sends startAt, endAt, assignedToId for drag/resize/move.
 */
export async function updateCalendarTask(
  id: string,
  payload: {
    startAt?: string
    endAt?: string
    assignedToId?: string | null
  }
): Promise<Response> {
  return fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startAt: payload.startAt ?? undefined,
      endAt: payload.endAt ?? undefined,
      assignedToId: payload.assignedToId ?? undefined,
    }),
  })
}
