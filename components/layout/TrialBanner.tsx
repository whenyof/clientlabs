"use client"

import { useState, useEffect } from "react"
import { Sparkles, AlertTriangle, X } from "lucide-react"
import Link from "next/link"

type TrialStatus =
  | { status: "trial_active"; daysLeft: number; planName?: string; trialEndsAt?: string; isStripeTrial?: boolean }
  | { status: "grace"; graceDaysLeft: number }
  | { status: "expired" }
  | { status: "active"; plan: string }
  | null

export function TrialBanner() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/settings/trial-status")
      .then((r) => r.json())
      .then((d: TrialStatus) => setTrialStatus(d))
      .catch(() => {})
  }, [])

  if (dismissed || !trialStatus) return null
  if (trialStatus.status === "active") return null

  if (trialStatus.status === "trial_active") {
    const { daysLeft, isStripeTrial, planName, trialEndsAt } = trialStatus

    // User chose a plan via Stripe → show plan name + exact billing date
    if (isStripeTrial && planName && trialEndsAt) {
      const endDate = new Date(trialEndsAt)
      const formattedDate = endDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })
      return (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
          style={{ background: "rgba(31,169,122,0.08)", borderBottom: "1px solid rgba(31,169,122,0.15)", color: "#0d7a58" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={13} className="shrink-0 text-[#1FA97A]" />
            <span>
              Estás en prueba gratuita del plan <strong>{planName}</strong> —{" "}
              {daysLeft > 0
                ? <>Te quedan <strong>{daysLeft} {daysLeft === 1 ? "día" : "días"}</strong>. Tu primer pago será el <strong>{formattedDate}</strong>.</>
                : <>Tu prueba termina hoy.</>
              }{" "}
              <Link
                href="/dashboard/settings?section=subscription"
                className="underline underline-offset-2 hover:text-[#1FA97A]"
              >
                Gestionar suscripción →
              </Link>
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded hover:bg-[rgba(31,169,122,0.12)] transition-colors"
            aria-label="Cerrar"
          >
            <X size={13} />
          </button>
        </div>
      )
    }

    // Pre-Stripe trial: user hasn't chosen a plan yet
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
        style={{ background: "rgba(31,169,122,0.08)", borderBottom: "1px solid rgba(31,169,122,0.15)", color: "#0d7a58" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={13} className="shrink-0 text-[#1FA97A]" />
          <span>
            Tu prueba termina en <strong>{daysLeft} {daysLeft === 1 ? "día" : "días"}</strong>.{" "}
            <Link href="/plan" className="underline underline-offset-2 hover:text-[#1FA97A]">
              Elige un plan
            </Link>{" "}
            para no perder el acceso.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-[rgba(31,169,122,0.12)] transition-colors"
          aria-label="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  if (trialStatus.status === "grace") {
    const { graceDaysLeft } = trialStatus
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
        style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.25)", color: "#92400e" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle size={13} className="shrink-0 text-amber-500" />
          <span>
            Tu prueba ha terminado. Tienes <strong>{graceDaysLeft} {graceDaysLeft === 1 ? "día" : "días"}</strong> antes de que tu cuenta pase a modo lectura.{" "}
            <Link href="/plan" className="underline underline-offset-2 font-semibold hover:text-amber-800">
              Elegir plan →
            </Link>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-amber-100 transition-colors"
          aria-label="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  // status === "expired" — gracia expirada, modo lectura
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
      style={{ background: "rgba(239,68,68,0.07)", borderBottom: "1px solid rgba(239,68,68,0.18)", color: "#b91c1c" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={13} className="shrink-0 text-red-500" />
        <span>
          Tu cuenta está en <strong>modo lectura</strong>. No se pueden crear ni editar datos hasta que elijas un plan.{" "}
          <Link href="/plan" className="underline underline-offset-2 font-semibold hover:text-red-700">
            Elegir plan →
          </Link>
        </span>
      </div>
    </div>
  )
}
