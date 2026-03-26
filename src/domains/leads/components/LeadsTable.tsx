"use client"

import { useLeads } from "@/hooks/useLeads"
import { useSearchParams } from "next/navigation"
import { useMemo, useRef, useCallback, useEffect } from "react"
import { LeadCard } from "@/modules/leads/components/LeadCard"
import { Upload, Globe, Zap, Loader2 } from "lucide-react"

function EmptyState() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 12,
        padding: 48,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
        {[Upload, Globe, Zap].map((Icon, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              borderRadius: 8,
              background: "var(--bg-surface)",
              border: "0.5px solid var(--border-subtle)",
            }}
          >
            <Icon size={24} style={{ color: "var(--text-secondary)" }} />
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
        Sin leads
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, maxWidth: 360, marginInline: "auto" }}>
        Los leads aparecerán aquí cuando captures contactos desde tu web o los importes.
      </p>
    </div>
  )
}

const HEADER_COLUMNS = [
  { label: "LEAD", className: "" },
  { label: "ESTADO", className: "" },
  { label: "FUENTE", className: "hidden md:block" },
  { label: "SCORE", className: "hidden md:block" },
  { label: "", className: "" },
]

export function LeadsTable() {
  const searchParams = useSearchParams()

  const filters = useMemo(() => ({
    status: searchParams.get("status") ?? "all",
    temperature: searchParams.get("temperature") ?? "all",
    source: searchParams.get("source") ?? "all",
    search: searchParams.get("search") ?? "",
    sortBy: searchParams.get("sortBy") ?? "createdAt",
    sortOrder: (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc",
    stale: searchParams.get("stale") ?? "false",
    showConverted: searchParams.get("showConverted") ?? "false",
    showLost: searchParams.get("showLost") ?? "false",
  }), [searchParams])

  const {
    leads,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useLeads(filters)

  // ── Infinite scroll ──
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLeadRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
    })
    if (node) observerRef.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  if (isLoading) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-subtle)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 56,
              borderBottom: "0.5px solid var(--border-subtle)",
              background: i % 2 === 0 ? "var(--bg-surface)" : "transparent",
            }}
            className="animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Table header */}
      <div
        className="grid grid-cols-[1fr_100px_auto] md:grid-cols-[2.5fr_140px_140px_180px_120px]"
        style={{
          padding: "10px 20px",
          background: "var(--bg-surface)",
          borderBottom: "0.5px solid var(--border-subtle)",
        }}
      >
        {HEADER_COLUMNS.map((col, i) => (
          <span
            key={i}
            className={col.className}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.05em",
              color: "var(--text-secondary)",
            }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {leads.map((lead, index) => {
        const isLast = index === leads.length - 1
        return (
          <div key={lead.id} ref={isLast ? lastLeadRef : undefined}>
            <LeadCard lead={lead} />
          </div>
        )
      })}

      {isFetchingNextPage && (
        <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-secondary)" }} />
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderTop: "0.5px solid var(--border-subtle)",
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <span>
          Mostrando {leads.length} de {total} {total === 1 ? "lead" : "leads"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#1FA97A",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          Actualizando en tiempo real
        </span>
      </div>
    </div>
  )
}
