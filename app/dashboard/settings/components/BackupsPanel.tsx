"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Download, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { UsageLimits } from "./UsageLimits"

const RETENTION = [
  { plan: "FREE",     label: "Free",     days: 7,   pct: 2 },
  { plan: "STARTER",  label: "Starter",  days: 30,  pct: 8 },
  { plan: "PRO",      label: "Pro",      days: 90,  pct: 25 },
  { plan: "BUSINESS", label: "Business", days: 365, pct: 100 },
] as const

const LS_KEY = "cl_last_backup_date"

function relativeDate(iso: string | null): { text: string; warn: boolean } {
  if (!iso) return { text: "Primera vez", warn: false }
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (diff < 1) return { text: "Hoy", warn: false }
  if (diff <= 30) return { text: `Hace ${diff} día${diff === 1 ? "" : "s"}`, warn: false }
  return { text: "Hace más de un mes ⚠️", warn: true }
}

type DownloadState = "idle" | "loading" | "error"

export function BackupsPanel() {
  const [dlState, setDlState] = useState<DownloadState>("idle")
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState("STARTER")

  useEffect(() => {
    setLastBackup(localStorage.getItem(LS_KEY))
    fetch("/api/settings/usage")
      .then(r => r.json())
      .then(d => { if (d.plan) setCurrentPlan(d.plan) })
      .catch(() => {})
  }, [])

  const handleDownload = async () => {
    setDlState("loading")
    try {
      const res = await fetch("/api/settings/export/all")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const date = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clientlabs-backup-${date}.zip`
      a.click()
      URL.revokeObjectURL(url)
      const now = new Date().toISOString()
      localStorage.setItem(LS_KEY, now)
      setLastBackup(now)
      setDlState("idle")
      toast.success("Backup descargado correctamente")
    } catch {
      setDlState("error")
      toast.error("No se pudo generar el backup")
    }
  }

  const { text: lastText, warn: lastWarn } = relativeDate(lastBackup)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">Backups</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Respalda y descarga todos tus datos</p>
      </div>

      {/* SECCIÓN 1 — Banner protección */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-[#1FA97A]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-slate-900">Tus datos están protegidos</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E1F5EE] text-[#1FA97A]">
              Sistema operativo
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
            Tu base de datos se respalda automáticamente cada 24 horas gracias a Neon PostgreSQL.
            Mantén siempre una copia local descargando tu backup.
          </p>
        </div>
      </div>

      {/* SECCIÓN 2 — Backup manual */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] font-semibold text-slate-900">Backup manual</p>
            <p className="text-[12px] text-slate-500 mt-0.5">Descarga todos tus datos ahora en formato ZIP.</p>
          </div>
          <div className={cn(
            "text-[11px] px-2.5 py-1 rounded-full font-medium",
            dlState === "loading" ? "bg-slate-100 text-slate-500"
              : dlState === "error" ? "bg-red-50 text-red-500"
              : "bg-[#E1F5EE] text-[#1FA97A]"
          )}>
            {dlState === "loading" ? "Preparando tu backup..." : dlState === "error" ? "No se pudo generar el backup" : "Listo para descargar"}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={dlState === "loading"}
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium bg-[#1FA97A] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {dlState === "loading"
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Preparando...</>
            : <><Download className="w-4 h-4" />Descargar backup completo</>
          }
        </button>

        <div className="pt-1 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <p className={cn("text-[11px]", lastWarn ? "text-amber-600 font-medium" : "text-slate-400")}>
            Última descarga: {lastText}
          </p>
          <p className="text-[11px] text-slate-400">
            Incluye: leads, clientes, facturas, proveedores, productos y perfil
          </p>
        </div>
      </div>

      {/* SECCIÓN 3 — Retención por plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <p className="text-[13px] font-semibold text-slate-900">Retención de backups automáticos</p>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Los backups automáticos se eliminan según la retención de tu plan. Descarga backups manuales para conservarlos indefinidamente.
          </p>
        </div>
        <div className="space-y-3">
          {RETENTION.map(r => {
            const isCurrent = currentPlan === r.plan || (currentPlan === "TRIAL" && r.plan === "PRO")
            return (
              <div key={r.plan} className={cn("rounded-lg p-3", isCurrent ? "bg-[#E1F5EE]/50 border border-[#1FA97A]/20" : "bg-slate-50")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-slate-700">{r.label}</span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#1FA97A] text-white uppercase tracking-wide">
                        Tu plan
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold text-slate-600 tabular-nums">{r.days} días</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", isCurrent ? "bg-[#1FA97A]" : "bg-slate-300")}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECCIÓN 4 — Uso del plan */}
      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-slate-900">Uso actual de tu plan</p>
        <UsageLimits />
      </div>
    </div>
  )
}
