/**
 * Lead detection — on lead-type events or any event with event.payload.email.
 * Find lead by userId + normalized email; create or update with lastSeenAt, name, visitorId.
 * New leads increment DailyStats.leads for the day.
 */

import { startOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

const LEAD_EVENT_TYPES = new Set([
  "lead_identified",
  "email_detected",
  "form_submit",
  "email_capture",
  "identify",
  "contact",
  "signup",
])

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
  const raw = event.payload?.email as string | undefined
  if (typeof raw !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return null
  return raw.trim().toLowerCase()
}

function classifyLeadDomain(email: string): { emailDomain: string; leadType: "personal" | "company" } {
  const domain = email.split("@")[1] ?? ""
  const leadType = PERSONAL_DOMAINS.includes(domain) ? "personal" : "company"
  return { emailDomain: domain, leadType }
}

export async function detectLead(event: QueuedEvent): Promise<void> {
  const email = extractEmail(event)
  if (!email) return
  const ts = new Date()
  const name = typeof event.payload?.name === "string" ? event.payload.name : undefined
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
        lastAction: event.type,
        ...(name != null && { name }),
        score: { increment: 5 },
      },
    })
    console.log("[lead] updated:", email)
    return
  }

  const existing = await prisma.lead.findFirst({
    where: {
      userId: event.userId,
      email,
    },
  })
  
  if (!existing) {
    await prisma.lead.create({
      data: {
        userId: event.userId,
        email,
        name: name ?? null,
        source: "sdk",
        status: "NEW",
        temperature: "COLD",
        lastActionAt: ts,
        lastAction: event.type,
        allowedDomain: event.domain,
        score: 10,
        metadata: {
          visitorId: event.visitor_id,
          emailDomain,
          leadType,
        },
      },
    })
  
    console.log("[lead] created:", email)
  } else {
    await prisma.lead.update({
      where: { id: existing.id },
      data: {
        lastActionAt: ts,
        lastAction: event.type,
        score: { increment: 5 },
      },
    })
  
    console.log("[lead] updated:", email)
  }

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
