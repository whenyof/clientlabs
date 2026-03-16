"use client"

import { Mail, PhoneCall, AlertTriangle, CreditCard, Activity, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface ClientHeaderProps {
  client: {
    name: string | null
    email: string | null
    status?: string | null
    companyName?: string | null
  }
  totalRevenue?: number | null
  score?: number | null
  onSendEmail?: () => void
  onRegisterPayment?: () => void
  onCreateTask?: () => void
  onMarkRisk?: () => void
}

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

function getScoreBadge(score: number | null | undefined) {
  if (score == null) return null
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const color =
    score >= 80
      ? " bg-emerald-100 text-emerald-700"
      : score >= 40
      ? " bg-yellow-100 text-yellow-700"
      : " bg-red-100 text-red-700"
  return <span className={base + color}>Score {score}</span>
}

export function ClientHeader({ client, totalRevenue, score, onSendEmail, onRegisterPayment, onCreateTask, onMarkRisk }: ClientHeaderProps) {
  const initial = getInitial(client.name, client.email)

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-base font-semibold text-neutral-700">
          {initial}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900">
              {client.name || client.companyName || "Sin nombre"}
            </h1>
            {client.status && (
              <Badge variant="secondary" className="text-xs font-normal">
                {client.status}
              </Badge>
            )}
          </div>
          {client.email && (
            <p className="text-sm text-neutral-600 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {client.email}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
            {typeof totalRevenue === "number" && (
              <span className="inline-flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-medium text-neutral-900">
                  €{totalRevenue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-neutral-500">ingresos totales</span>
              </span>
            )}
            {getScoreBadge(score ?? null)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={onSendEmail} disabled={!onSendEmail}>
          <Mail className="h-4 w-4" />
          <span>Enviar email</span>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onRegisterPayment} disabled={!onRegisterPayment}>
          <CreditCard className="h-4 w-4" />
          <span>Registrar pago</span>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCreateTask} disabled={!onCreateTask}>
          <Activity className="h-4 w-4" />
          <span>Crear tarea</span>
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onMarkRisk} disabled={!onMarkRisk}>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Marcar riesgo</span>
        </Button>
      </div>
    </header>
  )
}
