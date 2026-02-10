/**
 * Google Calendar sync for tasks.
 * Create/update/delete events. Uses Account refresh_token when available.
 */

import { prisma } from "@/lib/prisma"

type TaskPayload = {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
  status?: string
}

/**
 * Create a Google Calendar event for the task. Returns external event id.
 */
async function createGoogleEvent(
  userId: string,
  task: TaskPayload
): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!account?.refresh_token) {
    throw new Error("Google account not linked or missing refresh token")
  }

  const accessToken = await getAccessToken(account.refresh_token)
  const calendarId = "primary"
  const start = task.dueDate
    ? new Date(task.dueDate)
    : new Date()
  const end = new Date(start.getTime() + 30 * 60 * 1000)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: task.title,
        description: task.description ?? undefined,
        start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Calendar API: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { id?: string }
  if (!data.id) throw new Error("Google Calendar API did not return event id")
  return data.id
}

/**
 * Update an existing Google Calendar event.
 */
async function updateGoogleEvent(
  userId: string,
  externalEventId: string,
  task: TaskPayload
): Promise<void> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!account?.refresh_token) {
    throw new Error("Google account not linked or missing refresh token")
  }

  const accessToken = await getAccessToken(account.refresh_token)
  const calendarId = "primary"
  const start = task.dueDate ? new Date(task.dueDate) : new Date()
  const end = new Date(start.getTime() + 30 * 60 * 1000)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(externalEventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: task.title,
        description: task.description ?? undefined,
        start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Calendar API: ${res.status} ${err}`)
  }
}

/**
 * Delete a Google Calendar event.
 */
async function deleteGoogleEvent(
  userId: string,
  externalEventId: string
): Promise<void> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!account?.refresh_token) {
    throw new Error("Google account not linked or missing refresh token")
  }

  const accessToken = await getAccessToken(account.refresh_token)
  const calendarId = "primary"

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(externalEventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!res.ok && res.status !== 404) {
    const err = await res.text()
    throw new Error(`Google Calendar API: ${res.status} ${err}`)
  }
}

/**
 * Exchange refresh_token for access_token.
 */
async function getAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required for calendar sync")
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google OAuth: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("Google OAuth did not return access_token")
  return data.access_token
}

export const googleCalendarSync = {
  create: createGoogleEvent,
  update: updateGoogleEvent,
  delete: deleteGoogleEvent,
}
