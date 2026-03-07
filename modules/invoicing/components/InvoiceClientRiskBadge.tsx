"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

const riskStyles: Record<RiskLevel, string> = {
  LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
}

interface InvoiceClientRiskBadgeProps {
  clientId: string | null
  /** Only show for CUSTOMER invoices */
  invoiceType?: string
}

export function InvoiceClientRiskBadge({
  clientId,
  invoiceType = "CUSTOMER",
}: InvoiceClientRiskBadgeProps) {
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clientId || invoiceType !== "CUSTOMER") {
      setRiskLevel(null)
      return
    }
    setLoading(true)
    fetch(`/api/billing/clients/${encodeURIComponent(clientId)}/payment-profile`, {
      credentials: "include",
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const level = data?.profile?.riskLevel
        setRiskLevel(
          level === "LOW" || level === "MEDIUM" || level === "HIGH" ? level : null
        )
      })
      .catch(() => setRiskLevel(null))
      .finally(() => setLoading(false))
  }, [clientId, invoiceType])

  if (loading || !riskLevel) return null

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold mt-1",
        riskStyles[riskLevel]
      )}
    >
      {riskLevel === "LOW" && "Bajo riesgo"}
      {riskLevel === "MEDIUM" && "Riesgo medio"}
      {riskLevel === "HIGH" && "Alto riesgo"}
    </span>
  )
}
