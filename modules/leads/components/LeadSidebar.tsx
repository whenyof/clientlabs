"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { StickyNote, ChevronDown } from "lucide-react"
import { changeLeadStatus } from "../actions"
import { toast } from "sonner"

interface LeadSidebarProps {
  leadId: string
  lead: {
    email: string | null
    phone: string | null
    source: string
    leadStatus: string
    score: number
    temperature?: string | null
    createdAt: Date
  }
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  INTERESTED: "Interesado",
  QUALIFIED: "Calificado",
  CONVERTED: "Cliente",
  LOST: "Perdido",
}

const TEMP_LABELS: Record<string, string> = {
  HOT: "Caliente",
  WARM: "Tibio",
  COLD: "Frío",
}

interface InsightsData {
  identity: { notes: string | null }
}

export function LeadSidebar({ leadId, lead }: LeadSidebarProps) {
  const router = useRouter()
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [currentStatus, setCurrentStatus] = useState(lead.leadStatus)
  const [statusOpen, setStatusOpen] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/leads/${leadId}/insights`)
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch((err) => console.error("Error fetching sidebar insights:", err))
  }, [leadId])

  const statusLabel = STATUS_LABELS[currentStatus] ?? currentStatus
  const tempLabel = lead.temperature
    ? TEMP_LABELS[lead.temperature] ?? lead.temperature
    : "—"

  const handleStatusChange = async (newStatus: string) => {
    const prev = currentStatus
    setCurrentStatus(newStatus)
    setStatusOpen(false)
    setStatusLoading(true)
    const result = await changeLeadStatus(leadId, newStatus as any)
    if (result.success) {
      toast.success(`Estado cambiado a ${STATUS_LABELS[newStatus] ?? newStatus}`)
      router.refresh()
    } else {
      setCurrentStatus(prev)
      toast.error(result.error ?? "Error al cambiar estado")
    }
    setStatusLoading(false)
  }

  const isReadOnly = currentStatus === "CONVERTED" || currentStatus === "LOST"

  return (
    <div className="sticky top-24 space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Información
        </h3>
        <dl className="space-y-2.5 text-sm">
          <Row label="Email" value={lead.email ?? "—"} />
          <Row label="Teléfono" value={lead.phone ?? "—"} />
          <Row label="Fuente" value={lead.source ?? "—"} />

          {/* Estado — dropdown clickable */}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Estado</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => !isReadOnly && setStatusOpen(!statusOpen)}
                disabled={isReadOnly || statusLoading}
                className="flex items-center gap-1 text-neutral-900 font-medium hover:text-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {statusLabel}
                {!isReadOnly && <ChevronDown className="h-3 w-3 text-neutral-400" />}
              </button>
              {statusOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleStatusChange(key)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 transition-colors ${
                        key === currentStatus ? "text-neutral-900 font-semibold bg-neutral-50" : "text-neutral-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Row label="Temperatura" value={tempLabel} />
          <Row label="Score" value={String(lead.score)} />
          <Row
            label="Fecha creación"
            value={format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}
          />
        </dl>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <StickyNote className="h-3.5 w-3.5" />
          Notas internas
        </h3>
        <div className="min-h-[100px] rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-sm text-neutral-600">
          {insights?.identity?.notes ?? (
            <span className="italic text-neutral-400">
              Sin notas. Registra actividad arriba.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium truncate text-right max-w-[180px]">
        {value}
      </span>
    </div>
  )
}
