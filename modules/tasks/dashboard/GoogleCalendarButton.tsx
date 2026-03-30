"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarCheck, CalendarX, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

export function GoogleCalendarButton() {
  const qc = useQueryClient()
  const searchParams = useSearchParams()

  const { data, isLoading } = useQuery<{ connected: boolean; connectedAt: string | null }>({
    queryKey: ["calendar-status"],
    queryFn: async () => {
      const res = await fetch("/api/calendar/google/status")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    staleTime: 60_000,
  })

  // Show toast based on redirect param
  useEffect(() => {
    const param = searchParams.get("calendar")
    if (param === "connected") {
      toast.success("Google Calendar conectado")
      qc.invalidateQueries({ queryKey: ["calendar-status"] })
    } else if (param === "error") {
      toast.error("Error al conectar Google Calendar")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDisconnect = async () => {
    const res = await fetch("/api/calendar/google/disconnect", { method: "DELETE" })
    if (res.ok) {
      toast.success("Google Calendar desconectado")
      qc.invalidateQueries({ queryKey: ["calendar-status"] })
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "0.5px solid var(--border-subtle)", borderRadius: 8, background: "var(--bg-card)" }}>
        <Loader2 style={{ width: 13, height: 13, color: "var(--text-secondary)", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Calendario</span>
      </div>
    )
  }

  if (data?.connected) {
    return (
      <button
        type="button"
        onClick={handleDisconnect}
        title="Desconectar Google Calendar"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          border: "0.5px solid #1FA97A55",
          borderRadius: 8,
          background: "#1FA97A10",
          cursor: "pointer",
          color: "#1FA97A",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <CalendarCheck style={{ width: 14, height: 14 }} />
        Google Calendar
      </button>
    )
  }

  return (
    <a
      href="/api/calendar/google/connect"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 8,
        background: "var(--bg-card)",
        cursor: "pointer",
        color: "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
      }}
    >
      <CalendarX style={{ width: 14, height: 14 }} />
      Conectar Calendar
    </a>
  )
}
