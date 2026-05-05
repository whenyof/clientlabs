"use client"

import { useState, useEffect } from "react"
import { Sparkles, X } from "lucide-react"
import Link from "next/link"

interface UserPlan {
  plan: string
  isTrial: boolean
  planExpiresAt: string | null
}

export function TrialBanner() {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem("cl_plan_banner")
    if (cached) {
      try { setUserPlan(JSON.parse(cached)) } catch { /* ignore */ }
      return
    }

    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          const info = {
            plan: d.user.plan,
            isTrial: d.user.isTrial,
            planExpiresAt: d.user.planExpiresAt ?? null,
          }
          setUserPlan(info)
          sessionStorage.setItem("cl_plan_banner", JSON.stringify(info))
        }
      })
      .catch(() => {})
  }, [])

  if (dismissed || !userPlan) return null

  const isTrial = userPlan.isTrial || userPlan.plan === "TRIAL"
  if (!isTrial) return null

  let daysLeft: number | null = null
  let isExpired = false

  if (userPlan.planExpiresAt) {
    const ms = new Date(userPlan.planExpiresAt).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    isExpired = ms <= 0
  }

  if (isExpired) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
        style={{ background: "rgba(239,68,68,0.07)", borderBottom: "1px solid rgba(239,68,68,0.18)", color: "#b91c1c" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={13} className="shrink-0 text-red-500" />
          <span>
            Tu periodo de prueba ha terminado.{" "}
            <Link href="/plan" className="underline underline-offset-2 font-semibold hover:text-red-700">
              Elige un plan para continuar
            </Link>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
          aria-label="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
      style={{ background: "rgba(31,169,122,0.08)", borderBottom: "1px solid rgba(31,169,122,0.15)", color: "#0d7a58" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles size={13} className="shrink-0 text-[#1FA97A]" />
        {daysLeft !== null ? (
          <span>
            Tu periodo de prueba termina en <strong>{daysLeft} {daysLeft === 1 ? "día" : "días"}</strong>.{" "}
            <Link href="/plan" className="underline underline-offset-2 hover:text-[#1FA97A]">
              Elige un plan
            </Link>{" "}
            para no perder el acceso.
          </span>
        ) : (
          <span>
            Estás en periodo de prueba.{" "}
            <Link href="/plan" className="underline underline-offset-2 hover:text-[#1FA97A]">
              Elige un plan
            </Link>{" "}
            para continuar cuando termine.
          </span>
        )}
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
