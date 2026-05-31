"use client"

import { useState } from "react"
import { RefreshCw, List, LayoutGrid } from "lucide-react"
import { useSectorConfig } from "@shared/hooks/useSectorConfig"
import { CreateLeadButton } from "@/modules/leads/components/CreateLeadButton"
import { ConnectWebButton } from "@/modules/leads/components/ConnectWebButton"
import { AutomationsButton } from "@/modules/leads/components/AutomationsButton"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c",
}

function RecalculateScoresButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  async function handleClick() {
    setLoading(true)
    setStatus("idle")
    try {
      const res = await fetch("/api/admin/recalculate-scores", { method: "POST" })
      setStatus(res.ok ? "ok" : "error")
      setTimeout(() => setStatus("idle"), 3000)
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
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderRadius: 6,
        background: C.bg, border: `1px solid ${status === "ok" ? C.accent : status === "error" ? "#b91c1c" : C.line}`,
        color: status === "ok" ? C.accentInk : status === "error" ? "#b91c1c" : C.ink2,
        fontWeight: 550, fontSize: 12.5, cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all .12s ease",
      }}
    >
      <RefreshCw size={12} className={loading ? "animate-spin" : ""} strokeWidth={2} />
      {status === "ok" ? "Scores actualizados" : status === "error" ? "Error" : "Recalcular"}
    </button>
  )
}

export function LeadsHeader() {
  const { labels } = useSectorConfig()
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
      <div>
        <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
          {labels.leads?.pageTitle ?? "Leads"}
        </h1>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
          <span>Gestiona tu pipeline comercial</span>
          <span style={{ color: C.ink5 }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
            Score activo · IA
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* View toggle */}
        <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
          {(["list", "kanban"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5,
              fontFamily: "ui-monospace,monospace", fontSize: 11.5,
              color: viewMode === m ? C.ink : C.ink3, fontWeight: 500,
              background: viewMode === m ? "white" : "transparent",
              boxShadow: viewMode === m ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
              border: "none", cursor: "pointer",
            }}>
              {m === "list" ? <List size={11} /> : <LayoutGrid size={11} />}
              {m === "list" ? "Lista" : "Pipeline"}
            </button>
          ))}
        </div>
        <RecalculateScoresButton />
        <ConnectWebButton />
        <AutomationsButton />
        <CreateLeadButton />
      </div>
    </div>
  )
}
