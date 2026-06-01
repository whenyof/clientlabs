"use client"

import { useState } from "react"
import { toast } from "sonner"

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)

  async function checkout(plan: "STARTER" | "PRO" | "BUSINESS", period: "monthly" | "yearly") {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar el pago")
      if (data.url) window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar el pago"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Error al abrir el portal de facturación")
      if (data.url) window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al abrir el portal de facturación"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { checkout, openPortal, loading }
}
