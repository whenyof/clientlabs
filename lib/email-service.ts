/**
 * Email service — wrapper functions for each template.
 * All functions are non-blocking by design; callers should use .catch(console.error).
 */

import { sendEmail } from "@/lib/email"
import {
  welcomeEmail,
  verificationEmail,
  trialExpiringEmail,
  newLeadEmail,
  invoiceSentEmail,
  dailyTasksEmail,
  invoiceDueEmail,
  teamInviteEmail,
  passwordResetEmail,
  leadConvertedEmail,
  planLimitEmail,
  verificationCodeEmail,
  invoicePaidEmail,
  invoiceOverdueEmail,
  quoteSentEmail,
  subscriptionActivatedEmail,
  paymentFailedEmail,
  subscriptionCancelledEmail,
  weeklyBusinessSummaryEmail,
} from "@/lib/email-templates"

interface TaskItem {
  title: string
  priority?: string
  type?: string
  time?: string | null
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(to, "Bienvenido/a a ClientLabs 🚀", welcomeEmail(name))
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  return sendEmail(to, "Verifica tu email — ClientLabs", verificationEmail(name, verifyUrl))
}

export async function sendTrialExpiringEmail(to: string, name: string, daysLeft: number) {
  return sendEmail(
    to,
    `Tu prueba expira en ${daysLeft} día${daysLeft === 1 ? "" : "s"} — ClientLabs`,
    trialExpiringEmail(name, daysLeft)
  )
}

export async function sendNewLeadEmail(
  to: string,
  name: string,
  leadName: string,
  leadEmail: string,
  source: string
) {
  return sendEmail(
    to,
    `Nuevo lead: ${leadName} — ClientLabs`,
    newLeadEmail(name, leadName, leadEmail, source)
  )
}

export async function sendInvoiceSentEmail(
  to: string,
  clientName: string,
  invoiceNumber: string,
  total: number,
  businessName: string
) {
  return sendEmail(
    to,
    `Factura ${invoiceNumber} de ${businessName}`,
    invoiceSentEmail(clientName, invoiceNumber, total, businessName)
  )
}

export async function sendDailyTasksEmail(to: string, name: string, tasks: TaskItem[]) {
  return sendEmail(
    to,
    `Tus tareas para mañana — ClientLabs`,
    dailyTasksEmail(name, tasks)
  )
}

export async function sendInvoiceDueEmail(
  to: string,
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
) {
  return sendEmail(
    to,
    `Factura ${invoiceNumber} próxima a vencer — ClientLabs`,
    invoiceDueEmail(name, invoiceNumber, clientName, dueDate, total)
  )
}

export async function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  acceptUrl: string
) {
  return sendEmail(
    to,
    `${inviterName} te invita a ${workspaceName} — ClientLabs`,
    teamInviteEmail(inviterName, workspaceName, role, acceptUrl)
  )
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  return sendEmail(
    to,
    "Restablecer contraseña — ClientLabs",
    passwordResetEmail(name, resetUrl)
  )
}

export async function sendLeadConvertedEmail(to: string, name: string, leadName: string) {
  return sendEmail(
    to,
    `¡Nuevo cliente! ${leadName} — ClientLabs`,
    leadConvertedEmail(name, leadName)
  )
}

export async function sendPlanLimitEmail(
  to: string,
  name: string,
  resource: string,
  current: number,
  max: number
) {
  return sendEmail(
    to,
    `Límite alcanzado: ${resource} — ClientLabs`,
    planLimitEmail(name, resource, current, max)
  )
}

export async function sendVerificationCodeEmail(to: string, code: string) {
  return sendEmail(
    to,
    `${code} — Tu código de verificación de ClientLabs`,
    verificationCodeEmail(code)
  )
}

export async function sendInvoicePaidEmail(
  to: string,
  name: string,
  invoiceNumber: string,
  clientName: string,
  total: number
) {
  return sendEmail(
    to,
    `✅ Factura cobrada: ${invoiceNumber} — ClientLabs`,
    invoicePaidEmail(name, invoiceNumber, clientName, total)
  )
}

export async function sendInvoiceOverdueEmail(
  to: string,
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
) {
  return sendEmail(
    to,
    `🔴 Factura vencida: ${invoiceNumber} — ClientLabs`,
    invoiceOverdueEmail(name, invoiceNumber, clientName, dueDate, total)
  )
}

export async function sendQuoteSentEmail(
  to: string,
  clientName: string,
  quoteNumber: string,
  total: number,
  businessName: string
) {
  return sendEmail(
    to,
    `Presupuesto ${quoteNumber} de ${businessName}`,
    quoteSentEmail(clientName, quoteNumber, total, businessName)
  )
}

export async function sendSubscriptionActivatedEmail(
  to: string,
  name: string,
  plan: string,
  nextBillingDate: string
) {
  return sendEmail(
    to,
    `🎉 Plan ${plan} activado — ClientLabs`,
    subscriptionActivatedEmail(name, plan, nextBillingDate)
  )
}

export async function sendPaymentFailedEmail(
  to: string,
  name: string,
  plan: string,
  retryDate: string
) {
  return sendEmail(
    to,
    `⚠️ Pago fallido — ClientLabs`,
    paymentFailedEmail(name, plan, retryDate)
  )
}

export async function sendSubscriptionCancelledEmail(
  to: string,
  name: string,
  plan: string,
  accessUntil: string
) {
  return sendEmail(
    to,
    `Suscripción cancelada — ClientLabs`,
    subscriptionCancelledEmail(name, plan, accessUntil)
  )
}

interface WeeklyStats {
  newLeads: number
  invoicedAmount: number
  tasksCompleted: number
  openInvoices: number
  weekLabel: string
}

export async function sendWeeklyBusinessSummaryEmail(
  to: string,
  name: string,
  stats: WeeklyStats
) {
  return sendEmail(
    to,
    `📊 Tu resumen semanal — ${stats.weekLabel} — ClientLabs`,
    weeklyBusinessSummaryEmail(name, stats)
  )
}
