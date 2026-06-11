"use client"

import { TeamMembers } from "@/app/dashboard/settings/components/TeamMembers"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  ink: "#0a0a0a", ink3: "#737373",
  line: "#e8e8e8", line2: "#eeeeee",
}

export default function TeamPage() {
  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Equipo</h1>
        <div style={{ marginTop: 6, fontSize: 12.5, color: C.ink3 }}>
          Gestiona los miembros de tu equipo, invitaciones y permisos
        </div>
      </div>

      {/* ── TEAM MEMBERS (real data + invite flow) ────────── */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <TeamMembers />
      </div>
    </div>
  )
}
