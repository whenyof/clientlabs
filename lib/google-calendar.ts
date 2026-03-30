/**
 * Google Calendar OAuth2 integration using CalendarIntegration model.
 * Separate from the NextAuth login account — requires calendar scope.
 */

import { prisma } from "@/lib/prisma"

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar"
const REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI!

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  return res.json()
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { userId },
  })
  if (!integration) return null

  if (integration.expiresAt > new Date()) {
    return integration.accessToken
  }

  // Refresh
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: integration.refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) return null

  const data = (await res.json()) as { access_token: string; expires_in: number }
  const newExpiry = new Date(Date.now() + data.expires_in * 1000)

  await prisma.calendarIntegration.update({
    where: { userId },
    data: { accessToken: data.access_token, expiresAt: newExpiry },
  })

  return data.access_token
}

export async function syncTaskToGoogle(
  userId: string,
  task: {
    id: string
    title: string
    description?: string | null
    dueDate?: string | null
    startAt?: string | null
    endAt?: string | null
  }
): Promise<void> {
  const token = await getValidAccessToken(userId)
  if (!token) return

  const integration = await prisma.calendarIntegration.findUnique({ where: { userId } })
  const calendarId = integration?.calendarId ?? "primary"
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  const start = task.startAt
    ? new Date(task.startAt)
    : task.dueDate
    ? new Date(task.dueDate)
    : new Date()
  const end = task.endAt
    ? new Date(task.endAt)
    : new Date(start.getTime() + 30 * 60_000)

  const body = {
    summary: task.title,
    description: task.description ?? undefined,
    start: { dateTime: start.toISOString(), timeZone: tz },
    end: { dateTime: end.toISOString(), timeZone: tz },
  }

  const existing = await prisma.taskCalendarSync.findFirst({
    where: { taskId: task.id, provider: "GOOGLE" },
  })

  if (existing?.externalEventId) {
    // Update
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(existing.externalEventId)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )
    if (!res.ok) console.error("[calendar] update failed:", await res.text())
  } else {
    // Create
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )
    if (!res.ok) {
      console.error("[calendar] create failed:", await res.text())
      return
    }
    const data = (await res.json()) as { id?: string }
    if (data.id) {
      await prisma.taskCalendarSync.create({
        data: { taskId: task.id, userId, provider: "GOOGLE", externalEventId: data.id },
      })
    }
  }
}

export async function deleteTaskFromGoogle(userId: string, taskId: string): Promise<void> {
  const token = await getValidAccessToken(userId)
  if (!token) return

  const sync = await prisma.taskCalendarSync.findFirst({
    where: { taskId, provider: "GOOGLE" },
  })
  if (!sync?.externalEventId) return

  const integration = await prisma.calendarIntegration.findUnique({ where: { userId } })
  const calendarId = integration?.calendarId ?? "primary"

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(sync.externalEventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  if (res.ok || res.status === 404) {
    await prisma.taskCalendarSync.delete({ where: { id: sync.id } })
  }
}
