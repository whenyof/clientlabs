"use client"

import { useState, useEffect } from "react"

interface Integration {
  id: string
  name: string
  provider: string
  status: "connected" | "disconnected" | "error" | "pending"
  lastSync?: string
  errorMessage?: string
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/integrations")
      .then(res => res.ok ? res.json() : { data: [] })
      .then((json: { data?: Array<{ id: string; name: string; provider: string; status: string; lastSync?: string }> }) => {
        if (cancelled) return
        const list = json.data || []
        setIntegrations(list.map(i => ({
          id: i.id,
          name: i.name,
          provider: i.provider,
          status: (i.status === "CONNECTED" ? "connected" : i.status === "ERROR" ? "error" : i.status === "PENDING" ? "pending" : "disconnected") as Integration["status"],
          lastSync: i.lastSync,
        })))
      })
      .catch(() => { if (!cancelled) setIntegrations([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const connectIntegration = async (provider: string, type: string, config?: Record<string, unknown>) => {
    try {
      setLoading(true)
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, provider, config: config ?? {} }),
      })
      if (!res.ok) throw new Error("Failed to connect")
      setIntegrations(prev =>
        prev.map(int => int.provider === provider ? { ...int, status: "connected", lastSync: new Date().toISOString() } : int)
      )
    } catch {
      setError("No se pudo conectar la integración")
    } finally {
      setLoading(false)
    }
  }

  const disconnectIntegration = async (provider: string, type: string) => {
    try {
      setLoading(true)
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, provider }),
      })
      if (!res.ok) throw new Error("Failed to disconnect")
      setIntegrations(prev =>
        prev.map(int => int.provider === provider ? { ...int, status: "disconnected" } : int)
      )
    } catch {
      setError("No se pudo desconectar la integración")
    } finally {
      setLoading(false)
    }
  }

  return { integrations, loading, error, connectIntegration, disconnectIntegration }
}

export function useIntegrationLogs(integrationId?: string) {
  const [logs, setLogs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async (id?: string) => {
    const target = id ?? integrationId
    if (!target) return
    setLoading(true)
    try {
      const res = await fetch(`/api/integrations/logs?integrationId=${target}`)
      if (res.ok) {
        const json = await res.json()
        setLogs(json.logs ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (integrationId) fetchLogs(integrationId)
  }, [integrationId])

  return { logs, loading, fetchLogs }
}
