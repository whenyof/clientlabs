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
    // Check sessionStorage to avoid re-fetching on every navigation
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

  // Only show banner for FREE plan users or active trial users
  const isFree   = userPlan.plan === "FREE"
  const isTrial  = userPlan.isTrial && userPlan.plan !== "FREE"

  if (!isFree && !isTrial) return null

  // Calculate days left in trial
  let daysLeft: number | null = null
  if (isTrial && userPlan.planExpiresAt) {
    const ms = new Date(userPlan.planExpiresAt).getTime() - Date.now()
    daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
  }

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px] font-medium"
      style={{ background: "rgba(31,169,122,0.08)", borderBottom: "1px solid rgba(31,169,122,0.15)", color: "#0d7a58" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles size={13} className="shrink-0 text-[#1FA97A]" />
        {isTrial && daysLeft !== null ? (
          <span>
            Tu periodo de prueba termina en <strong>{daysLeft} {daysLeft === 1 ? "día" : "días"}</strong>.{" "}
            <Link href="/dashboard/settings?tab=plans" className="underline underline-offset-2 hover:text-[#1FA97A]">
              Elige un plan
            </Link>{" "}
            para no perder el acceso.
          </span>
        ) : (
          <span>
            Estás en el plan gratuito.{" "}
            <Link href="/dashboard/settings?tab=plans" className="underline underline-offset-2 hover:text-[#1FA97A]">
              Actualiza a Pro o Business
            </Link>{" "}
            para desbloquear todo.
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
