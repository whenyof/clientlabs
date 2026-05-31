"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Mail, Phone, Globe, ShoppingCart,
  CheckSquare, MoreVertical, ArrowUpRight,
} from "lucide-react"
import { ProviderSidePanel } from "./ProviderSidePanel"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
}

const TYPE_LABELS: Record<string, string> = {
  SERVICE: "Servicios profesionales", PRODUCT: "Productos",
  SOFTWARE: "Software", OTHER: "Otros",
}
const DEP_LABELS: Record<string, string> = {
  LOW: "Baja dependencia", MEDIUM: "Dependencia media",
  HIGH: "Alta dependencia", CRITICAL: "Dependencia crítica",
}
const STATUS_CFG: Record<string, { label: string; tone: string }> = {
  OK: { label: "Activo", tone: "green" }, ACTIVE: { label: "Activo", tone: "green" },
  PENDING: { label: "Pendiente", tone: "amber" }, ISSUE: { label: "Incidencia", tone: "red" },
  PAUSED: { label: "Pausado", tone: "amber" },
}
const TONE: Record<string, { bg: string; color: string }> = {
  green: { bg: C.accentSoft, color: C.accentInk },
  amber: { bg: C.warnSoft,   color: C.warn },
  red:   { bg: C.redSoft,    color: C.red },
  ink:   { bg: C.ink,        color: "white" },
}

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  const t = TONE[tone] ?? { bg: C.bg3, color: C.ink2 }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: t.bg, color: t.color }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: t.color, display: "inline-block" }} />
      {children}
    </span>
  )
}

type Provider = {
  id: string; name: string; type: string | null
  monthlyCost: number | null; status: string
  dependencyLevel: string; operationalState: string
  isCritical: boolean; contactEmail?: string | null
  contactPhone?: string | null; website?: string | null
  notes?: string | null; affectedArea?: string | null
  lastOrderDate?: Date | null; hasAlternative?: boolean
  createdAt: Date; updatedAt: Date
  payments?: unknown[]; tasks?: unknown[]
  _count?: { payments: number; tasks: number }
}

export function Provider360View({ initialProvider }: { initialProvider: Provider }) {
  const router = useRouter()
  const handleUpdate = () => router.refresh()

  const p = initialProvider
  const initials = p.name.split(" ").map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase()
  const stCfg = STATUS_CFG[p.status] ?? { label: p.status, tone: "amber" }
  const depLabel = DEP_LABELS[p.dependencyLevel] ?? p.dependencyLevel
  const typeLabel = TYPE_LABELS[p.type ?? "OTHER"] ?? p.type ?? "Proveedor"
  const fmtEur = (n: number) => `${new Intl.NumberFormat("es-ES").format(Math.round(n))} €`
  const totalSpend = (p.monthlyCost || 0) * 12
  const paymentsCount = p._count?.payments ?? 0
  const pendingTasks = p._count?.tasks ?? (p.tasks?.length ?? 0)

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── Back button ─────────────────────────────────── */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.line2}` }}>
        <Link href="/dashboard/providers" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.ink3, fontWeight: 500, textDecoration: "none" }}>
          <ChevronLeft size={13} strokeWidth={2.2} />
          Volver a proveedores
        </Link>
      </div>

      <div style={{ padding: "20px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          {/* Main */}
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
              {/* Avatar */}
              <div style={{ width: 52, height: 52, borderRadius: 10, background: "#f0ede6", color: "#6b5e3f", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18, flexShrink: 0, border: "1px solid rgba(120,100,60,.14)" }}>
                {initials}
              </div>
              {/* Identity */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, margin: "0 0 4px", color: C.ink }}>
                  {p.name} <span style={{ fontSize: 15, color: C.ink3, fontWeight: 400 }}>· {typeLabel}</span>
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                  {p.contactEmail && <a href={`mailto:${p.contactEmail}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.ink3, textDecoration: "none" }}><Mail size={13} strokeWidth={1.8} />{p.contactEmail}</a>}
                  {p.contactPhone && <a href={`tel:${p.contactPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.ink3, textDecoration: "none" }}><Phone size={13} strokeWidth={1.8} />{p.contactPhone}</a>}
                  {p.website && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.ink3 }}><Globe size={13} strokeWidth={1.7} />{p.website}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Pill tone={stCfg.tone}>{stCfg.label}</Pill>
                  {p.isCritical && <Pill tone="ink">Preferente</Pill>}
                  <Pill tone={["HIGH", "CRITICAL"].includes(p.dependencyLevel) ? "red" : p.dependencyLevel === "MEDIUM" ? "amber" : "ink"}>{depLabel}</Pill>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                {p.contactEmail && (
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
                    <Mail size={12} />Email
                  </button>
                )}
                {p.contactPhone && (
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
                    <Phone size={12} />Llamar
                  </button>
                )}
                <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
                  <CheckSquare size={12} />Tarea
                </button>
                <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.accent, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
                  <ShoppingCart size={12} />Nuevo pedido
                </button>
                <button style={{ width: 32, height: 32, borderRadius: 6, display: "grid", placeItems: "center", background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, cursor: "pointer" }}>
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
            {/* Meta bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line2}`, fontSize: 12.5, color: C.ink3 }}>
              <span>Desde {new Date(p.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}</span>
              <span style={{ color: C.ink5 }}>·</span>
              <span>Actualizado {new Date(p.updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
              {pendingTasks > 0 && <><span style={{ color: C.ink5 }}>·</span><span style={{ color: C.warn }}>{pendingTasks} tareas pend.</span></>}
            </div>
          </div>

          {/* Side KPI */}
          <div style={{ background: C.bg2, borderLeft: `1px solid ${C.line2}`, padding: 24 }}>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Gasto · año en curso
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.025em", fontSize: 26, color: C.ink, fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>
              {fmtEur(totalSpend)}
            </div>
            {p.monthlyCost && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.accentInk, marginBottom: 16 }}>
                <ArrowUpRight size={11} />{fmtEur(p.monthlyCost)} / mes
              </div>
            )}
            <div style={{ paddingTop: 14, borderTop: `1px solid ${C.line2}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Pedidos</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{paymentsCount}</div>
              </div>
              <div>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>Ticket medio</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>
                  {paymentsCount > 0 ? fmtEur(Math.round(totalSpend / paymentsCount)) : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
          {[
            { label: "Gasto · año en curso",  value: fmtEur(totalSpend),               sub: "12 meses acumulados" },
            { label: "Pedidos · 12 meses",     value: String(paymentsCount),             sub: `Ø ${paymentsCount > 0 ? (paymentsCount / 12).toFixed(1).replace(".", ",") : 0}/mes` },
            { label: "Coste mensual",           value: p.monthlyCost ? fmtEur(p.monthlyCost) : "—", sub: "recurrente" },
            { label: "Tareas pendientes",       value: String(pendingTasks),              sub: "vinculadas" },
          ].map((k, i, arr) => (
            <div key={k.label} style={{ padding: "14px 20px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
              <div style={{ fontSize: 11, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: C.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 5 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── EXISTING PROVIDER SIDE PANEL ─────────────── */}
        <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
          <ProviderSidePanel
            provider={p}
            open={true}
            onClose={() => router.push("/dashboard/providers")}
            onUpdate={handleUpdate}
            embeddedInPage={true}
          />
        </div>
      </div>
    </div>
  )
}
