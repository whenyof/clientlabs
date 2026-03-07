/**
 * Lead detection — on lead_identified, email_detected, or form_submit (with email).
 * Find lead by userId + normalized email; create or update with lastSeen and score.
 * New leads increment DailyStats.leads for the day.
 * Emails are normalized (trim, lowercase). Lead metadata includes emailDomain and leadType (personal | company).
 */

import { startOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

const LEAD_EVENT_TYPES = new Set(["lead_identified", "email_detected", "form_submit"])

const PERSONAL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]

function extractEmail(event: QueuedEvent): string | null {
  let raw: string | undefined
  if (event.type === "lead_identified" || event.type === "email_detected") {
    raw = event.payload?.email as string | undefined
  } else if (event.type === "form_submit") {
    raw = event.payload?.email as string | undefined
  }
  if (typeof raw !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return null
  return raw.trim().toLowerCase()
}

function classifyLeadDomain(email: string): { emailDomain: string; leadType: "personal" | "company" } {
  const domain = email.split("@")[1] ?? ""
  const leadType = PERSONAL_DOMAINS.includes(domain) ? "personal" : "company"
  return { emailDomain: domain, leadType }
}

export async function detectLead(event: QueuedEvent): Promise<void> {
  if (!LEAD_EVENT_TYPES.has(event.type)) return

  const email = extractEmail(event)
  if (!email) return

  const ts = new Date(event.timestamp)
  const { emailDomain, leadType } = classifyLeadDomain(email)

  const existing = await prisma.lead.findFirst({
    where: {
      userId: event.userId,
      email,
    },
  })

  if (existing) {
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        lastActionAt: ts,
        updatedAt: ts,
        score: { increment: 5 },
      },
    })
    return
  }

  await prisma.lead.create({
    data: {
      userId: event.userId,
      email,
      source: "WEB",
      lastActionAt: ts,
      allowedDomain: event.domain,
      score: 10,
      metadata: {
        visitorId: event.visitor_id,
        emailDomain,
        leadType,
      },
    },
  })

  const day = startOfDay(ts)
  const row = await prisma.dailyStats.findUnique({
    where: {
      userId_domain_day: { userId: event.userId, domain: event.domain, day },
    },
  })
  if (row) {
    await prisma.dailyStats.update({
      where: { id: row.id },
      data: { leads: { increment: 1 } },
    })
  } else {
    await prisma.dailyStats.create({
      data: {
        userId: event.userId,
        domain: event.domain,
        day,
        pageviews: 0,
        visitors: 0,
        sessions: 0,
        leads: 1,
      },
    })
  }
}
