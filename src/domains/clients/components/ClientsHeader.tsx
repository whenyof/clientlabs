"use client"

import { useState } from "react"
import { Download, List, BarChart2, Users } from "lucide-react"
import { CreateClientButton } from "@/modules/clients/components/CreateClientButton"
import { ImportClients } from "@/modules/clients/components/ImportClients"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
}

export function ClientsHeader() {
  const [viewMode, setViewMode] = useState<"list" | "health" | "cohort">("list")

  const views = [
    { id: "list" as const,   label: "Lista",    icon: <List size={11} /> },
    { id: "health" as const, label: "Salud",    icon: <BarChart2 size={11} /> },
    { id: "cohort" as const, label: "Retención",icon: <Users size={11} /> },
  ]

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
      <div>
        <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
          Clientes
        </h1>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
          <span>Gestión de relaciones e ingresos</span>
          <span style={{ color: C.ink5 }}>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
            22 requieren atención
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* View toggle */}
        <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5,
              fontFamily: "ui-monospace,monospace", fontSize: 11.5,
              color: viewMode === v.id ? C.ink : C.ink3, fontWeight: 500,
              background: viewMode === v.id ? "white" : "transparent",
              boxShadow: viewMode === v.id ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
              border: "none", cursor: "pointer",
            }}>
              {v.icon}{v.label}
            </button>
          ))}
        </div>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
          <Download size={12} strokeWidth={2} />Exportar CSV
        </button>
        <ImportClients />
        <CreateClientButton />
      </div>
    </div>
  )
}
