"use client"

import { Upload, Settings, Plus } from "lucide-react"
import { TeamMembers } from "@/app/dashboard/settings/components/TeamMembers"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c",
  blue: "#3756a4", violet: "#6d28d9",
}

// ─── Deterministic pseudo-random ────────────────────────────────────────────
const pRnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 10000; return x - Math.floor(x) }

// ─── Per-member heatmap row ──────────────────────────────────────────────────
function HeatmapRow({ seed, bias, label }: { seed: number; bias: number; label: string }) {
  const DAYS = 28
  const levelColors = ["#f5f5f5", "#d6efe3", "#a8debf", "#5fbd8c", C.accent, C.accentInk]
  const cells = Array.from({ length: DAYS }, (_, i) => {
    const dow = i % 7
    const isWeekend = dow === 5 || dow === 6
    let r = pRnd(seed + i * 1.7 + 0.5) * (0.7 + bias)
    if (isWeekend) r *= 0.18
    if (r > 0.92) return 5
    if (r > 0.78) return 4
    if (r > 0.55) return 3
    if (r > 0.32) return 2
    if (r > 0.12) return 1
    return 0
  })
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 18px" }}>
      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, width: 28, textAlign: "right", flexShrink: 0 }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAYS}, 1fr)`, gap: 3, flex: 1 }}>
        {cells.map((lvl, j) => (
          <div key={j} style={{ aspectRatio: "1", borderRadius: 2, background: levelColors[lvl] }} />
        ))}
      </div>
    </div>
  )
}

// Static team data for the design (will be overlaid by TeamMembers component)
const STATIC_MEMBERS = [
  { av: "MG", seed: 2, bias: 0.92, load: 92, loadColor: C.red   },
  { av: "PV", seed: 3, bias: 0.78, load: 78, loadColor: C.warn  },
  { av: "JR", seed: 4, bias: 0.64, load: 64, loadColor: C.warn  },
  { av: "WH", seed: 5, bias: 0.46, load: 46, loadColor: C.accent },
  { av: "LM", seed: 6, bias: 0.54, load: 54, loadColor: C.accent },
]

export default function TeamPage() {
  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Equipo</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>Miembros activos</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>3 invitaciones pendientes</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              Plan Business · 8 / 10 puestos
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Upload size={12} strokeWidth={2} />Importar CSV
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Settings size={12} strokeWidth={2} />Roles y permisos
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Invitar miembro
          </button>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 20, overflow: "hidden" }}>
        {[
          { label: "Miembros activos",    value: "—", unit: "",  sub: "conectados ahora" },
          { label: "Acciones del equipo", value: "1.284", unit: "", sub: "+18% vs sem ant." },
          { label: "Carga media",         value: "62",    unit: "%", sub: "saludable · 2 saturados" },
          { label: "Horas registradas",   value: "734",   unit: "h", sub: "+8% vs Abr" },
        ].map((k, i, arr) => (
          <div key={k.label} style={{ padding: "18px 22px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
            <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, fontVariantNumeric: "tabular-nums", color: C.ink }}>
              {k.value}<span style={{ fontSize: 18, color: C.ink3, fontWeight: 500, marginLeft: 2 }}>{k.unit}</span>
            </div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 8 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TEAM MEMBERS (existing component) ────────────── */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <TeamMembers />
      </div>

      {/* ACTIVITY HEATMAP: oculto hasta tener log de eventos real (julio) */}
    </div>
  )
}
