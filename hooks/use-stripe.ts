"use client"

import { useState } from "react"

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)

  async function checkout(plan: "PRO" | "BUSINESS", period: "monthly" | "yearly") {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar el pago")
      if (data.url) window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar el pago"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al abrir el portal")
      if (data.url) window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al abrir el portal"
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return { checkout, openPortal, loading }
}
