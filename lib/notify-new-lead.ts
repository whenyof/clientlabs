import { prisma } from "@/lib/prisma"
import { sendNewLeadEmail } from "@/lib/email-service"

export interface NewLeadNotifyOptions {
  leadId: string
  leadName?: string | null
  leadEmail?: string
  phone?: string | null
  source?: string
  pageUrl?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  capturedAt?: Date
}

export function notifyNewLeadCaptured(userId: string, opts: NewLeadNotifyOptions): void {
  Promise.resolve()
    .then(async () => {
      const displayName = opts.leadName || opts.leadEmail || "Lead"

      try {
        await prisma.notification.create({
          data: {
            userId,
            type: "lead_created",
            title: "Nuevo lead",
            message: `${displayName} ha entrado como nuevo lead.`,
            actionUrl: `/dashboard/leads/${opts.leadId}`,
          },
        })
      } catch { /* best-effort */ }

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, notificationPrefs: true },
        })
        if (!user?.email) return

        const prefs = user.notificationPrefs as Record<string, unknown> | null
        const newLeadPrefs = prefs?.newLead as Record<string, unknown> | undefined
        if (newLeadPrefs?.email === false) return

        sendNewLeadEmail({
          to: user.email,
          userName: user.name ?? "Usuario",
          leadName: opts.leadName ?? opts.leadEmail ?? "Lead",
          leadEmail: opts.leadEmail ?? "",
          phone: opts.phone ?? undefined,
          source: opts.source ?? "directo",
          capturedAt: opts.capturedAt ?? new Date(),
          pageUrl: opts.pageUrl,
          utmSource: opts.utmSource,
          utmMedium: opts.utmMedium,
          utmCampaign: opts.utmCampaign,
        }).catch(() => {})
      } catch { /* best-effort */ }
    })
    .catch(() => {})
}
