"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, AlertCircle, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export type PaymentProfile = {
 clientId: string
 averageDelayDays: number
 lateRate: number
 unpaidAmount: number
 lastPaymentAt: string | null
 riskScore: number
 riskLevel: "LOW" | "MEDIUM" | "HIGH"
 totalHistoricalBilled: number
 totalHistoricalPaid: number
 updatedAt: string
}

const riskStyles = {
 LOW: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]",
 MEDIUM: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 HIGH: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]",
}

const riskLabels = {
 LOW: "Bajo riesgo",
 MEDIUM: "Riesgo medio",
 HIGH: "Alto riesgo",
}

interface PaymentBehaviourCardProps {
 clientId: string
 currency?: string
}

export function PaymentBehaviourCard({ clientId, currency = "EUR" }: PaymentBehaviourCardProps) {
 const [profile, setProfile] = useState<PaymentProfile | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)

 useEffect(() => {
 if (!clientId) {
 setLoading(false)
 return
 }
 setLoading(true)
 setError(false)
 fetch(`/api/billing/clients/${encodeURIComponent(clientId)}/payment-profile`, {
 credentials: "include",
 })
 .then((res) => {
 if (!res.ok) throw new Error("Failed to load")
 return res.json()
 })
 .then((data) => {
 setProfile(data.profile ?? null)
 })
 .catch(() => setError(true))
 .finally(() => setLoading(false))
 }, [clientId])

 if (loading) {
 return (
 <div className="rounded-xl p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] animate-pulse">
 <div className="h-4 w-24 bg-[var(--bg-card)] rounded mb-3" />
 <div className="h-8 w-32 bg-[var(--bg-card)] rounded mb-4" />
 <div className="grid grid-cols-2 gap-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="h-10 bg-[var(--bg-card)] rounded" />
 ))}
 </div>
 </div>
 )
 }

 if (error || !profile) {
 return null
 }

 const riskStyle = riskStyles[profile.riskLevel]
 const delayColor =
 profile.averageDelayDays <= 0
 ? "text-[var(--accent)]"
 : profile.averageDelayDays <= 15
 ? "text-[var(--text-secondary)]"
 : "text-[var(--critical)]"
 const lateColor =
 profile.lateRate <= 20
 ? "text-[var(--accent)]"
 : profile.lateRate <= 50
 ? "text-[var(--text-secondary)]"
 : "text-[var(--critical)]"
 const outstandingColor =
 profile.unpaidAmount <= 0 ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"

 return (
 <div className="rounded-xl p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)]">
 <div className="flex items-center gap-2 mb-3">
 <TrendingUp className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
 Comportamiento de pago
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-2 mb-4">
 <span
 className={cn(
 "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
 riskStyle
 )}
 >
 {riskLabels[profile.riskLevel]}
 </span>
 </div>
 <div className="grid grid-cols-2 gap-x-4 gap-y-3">
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">
 <Clock className="h-3 w-3" /> Retraso medio
 </div>
 <p className={cn("text-sm font-semibold", delayColor)}>
 {profile.averageDelayDays <= 0
 ? "0 días"
 : `+${Math.round(profile.averageDelayDays)} días`}
 </p>
 </div>
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">
 <AlertCircle className="h-3 w-3" /> Pagos tarde
 </div>
 <p className={cn("text-sm font-semibold", lateColor)}>
 {profile.lateRate.toFixed(0)}%
 </p>
 </div>
 <div className="space-y-0.5 col-span-2">
 <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">
 <Wallet className="h-3 w-3" /> Pendiente vencido
 </div>
 <p className={cn("text-sm font-semibold", outstandingColor)}>
 {formatCurrency(profile.unpaidAmount, currency)}
 </p>
 </div>
 </div>
 </div>
 )
}
