import { prisma } from "@/lib/prisma"
import { sendNewLeadEmail, sendTrialExpiringEmail, sendPlanLimitEmail } from "@/lib/email-service"

interface NotificationInput {
  type: string
  title: string
  message: string
  actionUrl?: string
}

export async function createNotification(userId: string, data: NotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl ?? null,
      },
    })
  } catch {
    // Never crash the calling code if notifications fail
  }
}

export async function notifyNewLead(
  userId: string,
  leadName: string,
  leadId?: string,
  leadEmail?: string,
  source?: string
) {
  await createNotification(userId, {
    type: "lead_created",
    title: "Nuevo lead",
    message: `${leadName} ha entrado como nuevo lead.`,
    actionUrl: leadId ? `/dashboard/leads/${leadId}` : "/dashboard/leads",
  })
  // Send email notification non-blocking
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, notificationPrefs: true },
    })
    if (user?.email) {
      const prefs = user.notificationPrefs as Record<string, unknown> | null
      if (!prefs || prefs.newLeadEmail !== false) {
        sendNewLeadEmail(
          user.email,
          user.name ?? "Usuario",
          leadName,
          leadEmail ?? "",
          source ?? "directo"
        ).catch(console.error)
      }
    }
  } catch {
    // Never crash — notification is best-effort
  }
}

export async function notifyInvoiceDue(userId: string, invoiceNumber: string, invoiceId?: string) {
  await createNotification(userId, {
    type: "invoice_due",
    title: "Factura próxima a vencer",
    message: `La factura ${invoiceNumber} vence pronto.`,
    actionUrl: invoiceId ? `/dashboard/finance/invoices/${invoiceId}` : "/dashboard/finance",
  })
}

export async function notifyPlanLimit(
  userId: string,
  resource: string,
  current: number,
  max: number
) {
  await createNotification(userId, {
    type: "plan_limit",
    title: "Límite de plan próximo",
    message: `Has usado ${current} de ${max} ${resource}. Considera actualizar tu plan.`,
    actionUrl: "/precios",
  })
}

export async function notifyTrialExpiring(userId: string, daysLeft: number) {
  await createNotification(userId, {
    type: "trial_expiring",
    title: "Tu prueba gratuita expira pronto",
    message: `Tu prueba gratuita expira en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}.`,
    actionUrl: "/dashboard/finance/billing",
  })
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })
    if (user?.email) {
      sendTrialExpiringEmail(user.email, user.name ?? "Usuario", daysLeft).catch(console.error)
    }
  } catch {
    // Never crash
  }
}
