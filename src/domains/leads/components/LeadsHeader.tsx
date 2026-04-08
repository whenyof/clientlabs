"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useSectorConfig } from "@shared/hooks/useSectorConfig"
import { CreateLeadButton } from "@/modules/leads/components/CreateLeadButton"
import { ConnectWebButton } from "@/modules/leads/components/ConnectWebButton"
import { AutomationsButton } from "@/modules/leads/components/AutomationsButton"

function RecalculateScoresButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  async function handleClick() {
    setLoading(true)
    setStatus("idle")
    try {
      const res = await fetch("/api/admin/recalculate-scores", { method: "POST" })
      if (res.ok) {
        setStatus("ok")
        setTimeout(() => setStatus("idle"), 3000)
      } else {
        setStatus("error")
        setTimeout(() => setStatus("idle"), 3000)
      }
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Recalcular scores"
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
        status === "ok"
          ? "border-[#1FA97A] text-[#1FA97A] bg-[#1FA97A]/5"
          : status === "error"
          ? "border-red-400 text-red-500 bg-red-50"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800",
        loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      {status === "ok" ? "Scores actualizados" : status === "error" ? "Error al recalcular" : "Recalcular scores"}
    </button>
  )
}

export function LeadsHeader() {
  const { labels } = useSectorConfig()
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {labels.leads?.pageTitle ?? "Mis Leads"}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500 truncate max-w-xl">
          {labels.leads?.pageSubtitle ?? "Gestiona tus contactos y conviértelos en clientes"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <RecalculateScoresButton />
        <ConnectWebButton />
        <AutomationsButton />
        <CreateLeadButton />
      </div>
    </div>
  )
}

