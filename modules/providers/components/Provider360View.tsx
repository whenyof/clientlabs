"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft, Mail, Phone, Globe, ShoppingCart,
  CheckSquare, MoreVertical, Package, FileText,
  Activity, BarChart2, Plus, RefreshCw,
} from "lucide-react"
import {
  getProviderProducts,
  getProviderOrders,
  getProviderTimeline,
  getProviderTasks,
  addProviderNote,
  createProviderTask,
} from "../actions"

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", blueSoft: "#eef2fb",
}

const TYPE_LABELS: Record<string, string> = {
  SERVICE: "Servicios profesionales", PRODUCT: "Productos",
  SOFTWARE: "Software", OTHER: "Otros",
}
const DEP_LABELS: Record<string, string> = {
  LOW: "Dependencia baja", MEDIUM: "Dependencia media",
  HIGH: "Alta dependencia", CRITICAL: "Dependencia crítica",
}
const STATUS_CFG: Record<string, { label: string; tone: "green"|"amber"|"red" }> = {
  OK:     { label: "Activo",     tone: "green" },
  ACTIVE: { label: "Activo",     tone: "green" },
  PENDING:{ label: "Pendiente",  tone: "amber" },
  ISSUE:  { label: "Incidencia", tone: "red" },
  PAUSED: { label: "Pausado",    tone: "amber" },
}
const TONE: Record<string, { bg: string; color: string }> = {
  green:  { bg: C.accentSoft, color: C.accentInk },
  amber:  { bg: C.warnSoft,   color: C.warn },
  red:    { bg: C.redSoft,    color: C.red },
  blue:   { bg: C.blueSoft,   color: C.blue },
  ink:    { bg: C.ink,        color: "white" },
  neutral:{ bg: C.bg3,        color: C.ink2 },
}

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  const t = TONE[tone] ?? TONE.neutral
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

type TabId = "catalogo" | "compras" | "documentos" | "notas" | "actividad"

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "catalogo",  label: "Catálogo",   Icon: Package    },
  { id: "compras",   label: "Compras",    Icon: BarChart2  },
  { id: "documentos",label: "Documentos", Icon: FileText   },
  { id: "notas",     label: "Notas",      Icon: CheckSquare},
  { id: "actividad", label: "Actividad",  Icon: Activity   },
]

export function Provider360View({ initialProvider }: { initialProvider: Provider }) {
  const router = useRouter()
  const p = initialProvider

  const initials = p.name.split(" ").map(w => w[0] ?? "").slice(0, 2).join("").toUpperCase()
  const stCfg = STATUS_CFG[p.status] ?? { label: p.status, tone: "amber" as const }
  const depLabel = DEP_LABELS[p.dependencyLevel] ?? p.dependencyLevel
  const typeLabel = TYPE_LABELS[p.type ?? "OTHER"] ?? p.type ?? "Proveedor"
  const fmtEur = (n: number) => `${new Intl.NumberFormat("es-ES").format(Math.round(n))} €`
  const totalSpend = (p.monthlyCost || 0) * 12
  const paymentsCount = p._count?.payments ?? 0
  const pendingTasks = p._count?.tasks ?? (p.tasks?.length ?? 0)
  const reliabilityScore = p.operationalState === "OK" ? 95 : p.operationalState === "PAUSED" ? 75 : 60
  const depTone = ["HIGH","CRITICAL"].includes(p.dependencyLevel) ? "red" : p.dependencyLevel === "MEDIUM" ? "amber" : "green"

  const [tab, setTab] = useState<TabId>("catalogo")
  const [products,   setProducts]   = useState<any[]>([])
  const [orders,     setOrders]     = useState<any[]>([])
  const [timeline,   setTimeline]   = useState<any[]>([])
  const [tasks,      setTasks]      = useState<any[]>([])
  const [loadingTab, setLoadingTab] = useState(false)
  const [noteText,   setNoteText]   = useState(p.notes ?? "")
  const [savingNote, setSavingNote] = useState(false)
  const [newTask,    setNewTask]    = useState("")
  const [addingTask, setAddingTask] = useState(false)

  useEffect(() => {
    if (tab === "catalogo" && products.length === 0) {
      setLoadingTab(true)
      getProviderProducts(p.id).then(r => { setProducts((r as any)?.products ?? r ?? []); setLoadingTab(false) }).catch(() => setLoadingTab(false))
    }
    if (tab === "documentos" && orders.length === 0) {
      setLoadingTab(true)
      getProviderOrders(p.id).then(r => { setOrders((r as any)?.orders ?? r ?? []); setLoadingTab(false) }).catch(() => setLoadingTab(false))
    }
    if (tab === "actividad" && timeline.length === 0) {
      setLoadingTab(true)
      getProviderTimeline(p.id).then(r => { setTimeline(Array.isArray(r) ? r : (r as any)?.timeline ?? []); setLoadingTab(false) }).catch(() => setLoadingTab(false))
    }
    if (tab === "notas" && tasks.length === 0) {
      getProviderTasks(p.id).then(r => setTasks((r as any)?.tasks ?? r ?? [])).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function handleSaveNote() {
    if (!noteText.trim()) return
    setSavingNote(true)
    try { await addProviderNote(p.id, noteText.trim()); router.refresh() } catch {}
    setSavingNote(false)
  }

  async function handleAddTask() {
    if (!newTask.trim()) return
    setAddingTask(true)
    try {
      await createProviderTask({ providerId: p.id, title: newTask.trim(), priority: "MEDIUM" })
      setNewTask("")
      const updated = await getProviderTasks(p.id)
      setTasks((updated as any)?.tasks ?? updated ?? [])
    } catch {}
    setAddingTask(false)
  }

  const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }
  const rcard: React.CSSProperties = { background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }
  const rcardHead: React.CSSProperties = { padding: "11px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line2}` }
  const rcardLabel: React.CSSProperties = { fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink3, fontWeight: 600, margin: 0 }
  const rcardBody: React.CSSProperties = { padding: "12px 16px 14px" }
  const infoKey: React.CSSProperties = { fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink4, fontWeight: 500 }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* Back link */}
      <div style={{ padding: "13px 24px", borderBottom: `1px solid ${C.line2}` }}>
        <Link href="/dashboard/providers" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.ink3, fontWeight: 500, fontFamily: "ui-monospace,monospace", padding: "3px 7px", borderRadius: 5, textDecoration: "none" }}>
          <ChevronLeft size={13} strokeWidth={2.2} />
          Volver a proveedores
        </Link>
      </div>

      <div style={{ padding: "20px 24px 80px", maxWidth: 1320, margin: "0 auto" }}>

        {/* ════ HERO ═══════════════════════════════════════════ */}
        <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px" }}>
            <div style={{ padding: "20px 22px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Avatar — ink bg distinguishes providers from leads/clients */}
                <div style={{ width: 52, height: 52, borderRadius: 10, background: C.ink, color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19, flexShrink: 0, letterSpacing: "-0.02em" }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 22, margin: 0, color: C.ink, lineHeight: 1.15 }}>
                    {p.name}
                    <span style={{ fontSize: 14, color: C.ink3, fontWeight: 450, marginLeft: 7, letterSpacing: "-0.005em" }}>· {typeLabel}</span>
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12.5 }}>
                    {p.contactEmail && <a href={`mailto:${p.contactEmail}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.ink2, textDecoration: "none" }}><Mail size={12} strokeWidth={1.8} color={C.ink4} />{p.contactEmail}</a>}
                    {p.contactPhone && <a href={`tel:${p.contactPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.ink2, textDecoration: "none" }}><Phone size={12} strokeWidth={1.8} color={C.ink4} />{p.contactPhone}</a>}
                    {p.website && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.ink3 }}><Globe size={12} strokeWidth={1.7} color={C.ink4} />{p.website}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                    <Pill tone={stCfg.tone}>{stCfg.label}</Pill>
                    {p.isCritical && <Pill tone="ink">Preferente</Pill>}
                    <Pill tone={depTone}>{depLabel}</Pill>
                    {p.hasAlternative === false && <Pill tone="amber">Sin alternativa</Pill>}
                  </div>
                </div>
                {/* Action group */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: 3, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8 }}>
                    {p.contactEmail && (
                      <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, background: "transparent", border: 0, color: C.ink2, cursor: "pointer", borderRadius: 5 }}>
                        <Mail size={12} />Email
                      </button>
                    )}
                    {p.contactPhone && (
                      <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, background: "transparent", border: 0, color: C.ink2, cursor: "pointer", borderRadius: 5 }}>
                        <Phone size={12} />Llamar
                      </button>
                    )}
                    <button onClick={() => setTab("notas")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", fontSize: 12, fontWeight: 500, background: "transparent", border: 0, color: C.ink2, cursor: "pointer", borderRadius: 5 }}>
                      <CheckSquare size={12} />Tarea
                    </button>
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 6, background: C.accent, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
                    <ShoppingCart size={12} />Nuevo pedido
                  </button>
                  <button style={{ width: 32, height: 32, borderRadius: 6, display: "grid", placeItems: "center", background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, cursor: "pointer" }}>
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: spend */}
            <div style={{ background: C.bg2, borderLeft: `1px solid ${C.line2}`, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.13em", textTransform: "uppercase" as const, color: C.ink4, fontWeight: 500, marginBottom: 6 }}>
                Gasto en este proveedor · año
              </div>
              <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 32, color: C.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {fmtEur(totalSpend)}
              </div>
              {p.monthlyCost && (
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.accentInk, marginTop: 6 }}>
                  {fmtEur(p.monthlyCost)} / mes
                </div>
              )}
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${C.line2}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.ink4, fontWeight: 500, marginBottom: 2 }}>Pedidos</div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{paymentsCount}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.ink4, fontWeight: 500, marginBottom: 2 }}>Ticket medio</div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                    {paymentsCount > 0 ? fmtEur(Math.round(totalSpend / paymentsCount)) : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meta strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${C.line2}`, background: C.bg2 }}>
            {[
              { lbl: "Tipo",            v: typeLabel },
              { lbl: "Proveedor desde", v: new Date(p.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" }) },
              { lbl: "Último pedido",   v: p.lastOrderDate ? new Date(p.lastOrderDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—" },
              { lbl: "Gasto mensual",   v: p.monthlyCost ? fmtEur(p.monthlyCost) : "—" },
            ].map((cell, i, arr) => (
              <div key={cell.lbl} style={{ padding: "11px 22px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={rcardLabel}>{cell.lbl}</span>
                <span style={{ fontSize: 12.5, fontWeight: 550, color: C.ink, letterSpacing: "-0.003em" }}>{cell.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════ KPI STRIP ══════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 16, overflow: "hidden" }}>
          {[
            { label: "Gasto · año en curso", value: fmtEur(totalSpend),                   sub: "12 meses acumulados" },
            { label: "Pedidos · historial",  value: String(paymentsCount),                 sub: `Ø ${paymentsCount > 0 ? (paymentsCount / 12).toFixed(1) : "0"}/mes` },
            { label: "Dependencia",          value: DEP_LABELS[p.dependencyLevel]?.split(" ")[0] ?? p.dependencyLevel, sub: p.dependencyLevel.toLowerCase() },
            { label: "Fiabilidad estimada",  value: `${reliabilityScore}%`,               sub: p.operationalState === "OK" ? "Estado operativo OK" : p.operationalState.toLowerCase() },
          ].map((k, i, arr) => (
            <div key={k.label} style={{ padding: "14px 20px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
              <div style={{ fontSize: 11, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: C.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ════ TWO-COLUMN LAYOUT ═════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 16, alignItems: "start" }}>

          {/* ── LEFT: Tabbed panel ────────────────────────────── */}
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2, borderBottom: `1px solid ${C.line2}`, padding: "0 18px" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 12px 10px", fontSize: 12.5, color: tab === t.id ? C.ink : C.ink3, fontWeight: tab === t.id ? 600 : 500, borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: tab === t.id ? `2px solid ${C.ink}` : "2px solid transparent", cursor: "pointer", background: "none", letterSpacing: "-0.003em" }}>
                  <t.Icon size={13} strokeWidth={1.8} />{t.label}
                </button>
              ))}
            </div>

            <div style={{ minHeight: 280 }}>
              {loadingTab && tab !== "notas" && tab !== "compras" && (
                <div style={{ padding: 40, textAlign: "center", color: C.ink4, fontSize: 12.5 }}>Cargando…</div>
              )}

              {/* CATÁLOGO */}
              {tab === "catalogo" && !loadingTab && (
                <div>
                  {products.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px", textAlign: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bg3, display: "grid", placeItems: "center", color: C.ink3, marginBottom: 12 }}>
                        <Package size={20} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, letterSpacing: "-0.01em", marginBottom: 4 }}>Sin productos en catálogo</div>
                      <div style={{ fontSize: 13, color: C.ink3, maxWidth: 320 }}>Añade referencias al catálogo de este proveedor para incluirlas en pedidos.</div>
                      <button style={{ ...btnGhost, marginTop: 14, color: C.accentInk, borderColor: C.accentSoft, background: C.accentSoft }}>
                        <Plus size={12} />Añadir producto
                      </button>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
                        <thead>
                          <tr>
                            {["Producto", "Categoría", "Unidad", "Precio"].map((h, i) => (
                              <th key={h} style={{ textAlign: i === 3 ? "right" : "left", padding: "9px 18px", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, borderBottom: `1px solid ${C.line2}`, background: C.bg2, whiteSpace: "nowrap" as const }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((prod: any) => (
                            <tr key={prod.id}>
                              <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                <div style={{ fontWeight: 550, color: C.ink }}>{prod.name}</div>
                                {prod.reference && <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>{prod.reference}</div>}
                              </td>
                              <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink2, background: C.bg3, border: `1px solid ${C.line2}`, borderRadius: 5, padding: "1px 7px" }}>{prod.category ?? "—"}</span>
                              </td>
                              <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>{prod.unit ?? "Ud"}</span>
                              </td>
                              <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}`, textAlign: "right" as const }}>
                                <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                                  {prod.price != null ? fmtEur(prod.price) : "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderTop: `1px solid ${C.line2}`, background: C.bg2, fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>
                        <span>{products.length} referencias activas</span>
                        <button style={{ ...btnGhost, fontSize: 11.5, padding: "4px 9px" }}><Plus size={11} />Añadir</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMPRAS */}
              {tab === "compras" && (
                <div style={{ padding: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: C.ink, marginBottom: 4, letterSpacing: "-0.01em" }}>Evolución de compras · 12 meses</div>
                  <div style={{ fontSize: 12.5, color: C.ink3, marginBottom: 16 }}>
                    {p.monthlyCost ? `Coste mensual estimado: ${fmtEur(p.monthlyCost)}` : "Sin datos de coste mensual configurados."}
                  </div>
                  {p.monthlyCost ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
                        {Array.from({ length: 12 }, (_, i) => {
                          const months = ["E","F","M","A","M","J","J","A","S","O","N","D"]
                          const isLast = i === 11
                          return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                              <div style={{ width: "100%", maxWidth: 26, borderRadius: "4px 4px 2px 2px", background: isLast ? C.accent : C.ink5, height: `${Math.max(10, 60 + Math.sin(i) * 25)}%` }} />
                              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: C.ink4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{months[i]}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, marginTop: 8, borderTop: `1px solid ${C.line2}`, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
                        <span>Total estimado · año · {fmtEur(totalSpend)}</span>
                        <span>Media · {fmtEur(p.monthlyCost)}/mes</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "30px 0", textAlign: "center", color: C.ink4, fontSize: 12.5, fontStyle: "italic" }}>Sin datos de coste disponibles</div>
                  )}
                </div>
              )}

              {/* DOCUMENTOS */}
              {tab === "documentos" && !loadingTab && (
                <div>
                  {orders.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px", textAlign: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bg3, display: "grid", placeItems: "center", color: C.ink3, marginBottom: 12 }}>
                        <FileText size={20} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, letterSpacing: "-0.01em", marginBottom: 4 }}>Sin documentos</div>
                      <div style={{ fontSize: 13, color: C.ink3, maxWidth: 320 }}>Los pedidos y facturas de este proveedor aparecerán aquí.</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                        <thead>
                          <tr>
                            {["Referencia", "Descripción", "Fecha", "Estado", "Importe"].map((h, i) => (
                              <th key={h} style={{ textAlign: i === 4 ? "right" : "left", padding: "9px 18px", fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, borderBottom: `1px solid ${C.line2}`, background: C.bg2, whiteSpace: "nowrap" as const }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord: any) => {
                            const stLabel: Record<string, string> = { PENDING: "Pendiente", SENT: "Enviado", RECEIVED: "Recibido", COMPLETED: "Completado", CANCELLED: "Cancelado" }
                            const stTone: Record<string, string> = { PENDING: "amber", SENT: "blue", RECEIVED: "green", COMPLETED: "green", CANCELLED: "neutral" }
                            const ot = TONE[stTone[ord.status] ?? "neutral"]
                            return (
                              <tr key={ord.id}>
                                <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                  <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, fontSize: 12, color: C.ink }}>{ord.reference ?? ord.id.slice(0, 8)}</span>
                                </td>
                                <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}`, color: C.ink2, fontWeight: 500 }}>{ord.description ?? "—"}</td>
                                <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
                                    {ord.orderDate ? new Date(ord.orderDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}` }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: ot.bg, color: ot.color }}>
                                    <span style={{ width: 5, height: 5, borderRadius: 99, background: ot.color }} />
                                    {stLabel[ord.status] ?? ord.status}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 18px", borderBottom: `1px solid ${C.line3}`, textAlign: "right" as const }}>
                                  <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
                                    {ord.totalAmount != null ? fmtEur(ord.totalAmount) : "—"}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.line2}`, background: C.bg2, fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>
                        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} registrados
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NOTAS */}
              {tab === "notas" && (
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.ink4, marginBottom: 10, fontWeight: 500 }}>
                    Notas internas · visibles para el equipo
                  </div>
                  <div style={{ border: `1px solid ${C.line}`, borderRadius: 9, padding: "10px 12px", background: C.bg }}>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Escribe una nota sobre este proveedor…"
                      style={{ width: "100%", border: 0, outline: 0, resize: "vertical", minHeight: 80, fontSize: 13, lineHeight: 1.5, fontFamily: "inherit", background: "transparent", color: C.ink }}
                    />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.line}` }}>
                      <button onClick={() => setNoteText(p.notes ?? "")} style={btnGhost}>Descartar</button>
                      <button onClick={handleSaveNote} disabled={savingNote} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer", opacity: savingNote ? 0.6 : 1 }}>
                        {savingNote ? "Guardando…" : "Guardar nota"}
                      </button>
                    </div>
                  </div>
                  {tasks.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.ink4, marginBottom: 10, fontWeight: 500 }}>Tareas vinculadas</div>
                      {tasks.slice(0, 5).map((t: any) => (
                        <div key={t.id} style={{ display: "grid", gridTemplateColumns: "18px 1fr auto", gap: 10, padding: "9px 0", alignItems: "center", borderTop: `1px solid ${C.line3}` }}>
                          <input type="checkbox" defaultChecked={t.status === "COMPLETED"} style={{ width: 14, height: 14, accentColor: C.ink }} />
                          <span style={{ fontSize: 12.5, color: t.status === "COMPLETED" ? C.ink3 : C.ink, fontWeight: 500 }}>{t.title}</span>
                          {t.dueDate && <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>{new Date(t.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                    <input
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddTask() }}
                      placeholder="Nueva tarea… (Enter para añadir)"
                      style={{ flex: 1, padding: "7px 10px", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12.5, outline: 0, fontFamily: "inherit" }}
                    />
                    <button onClick={handleAddTask} disabled={addingTask || !newTask.trim()} style={{ ...btnGhost, opacity: !newTask.trim() ? 0.5 : 1 }}>
                      <Plus size={12} />{addingTask ? "…" : "Añadir"}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVIDAD */}
              {tab === "actividad" && !loadingTab && (
                <div>
                  {timeline.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px", textAlign: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bg3, display: "grid", placeItems: "center", color: C.ink3, marginBottom: 12 }}>
                        <Activity size={20} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, letterSpacing: "-0.01em", marginBottom: 4 }}>Sin actividad registrada</div>
                      <div style={{ fontSize: 13, color: C.ink3 }}>Los eventos de este proveedor aparecerán aquí.</div>
                    </div>
                  ) : (
                    timeline.map((ev: any, i: number) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, padding: "12px 18px", alignItems: "flex-start", borderTop: i === 0 ? "none" : `1px solid ${C.line2}` }}>
                        <div style={{ width: 22, height: 22, borderRadius: 99, background: C.accentSoft, display: "grid", placeItems: "center", color: C.accentInk }}>
                          <Activity size={11} strokeWidth={2} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 550, letterSpacing: "-0.003em" }}>{ev.description ?? ev.title ?? "Evento"}</div>
                          {ev.metadata && <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2, fontFamily: "ui-monospace,monospace" }}>{typeof ev.metadata === "string" ? ev.metadata : JSON.stringify(ev.metadata).slice(0, 60)}</div>}
                        </div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, paddingTop: 3 }}>
                          {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT RAIL ─────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Fiabilidad scorecard */}
            <div style={rcard}>
              <div style={rcardHead}>
                <h4 style={rcardLabel}>Fiabilidad del proveedor</h4>
                <button style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "3px 7px", borderRadius: 5, background: "none", border: "none" }}>
                  <RefreshCw size={10} />Recalcular
                </button>
              </div>
              <div style={rcardBody}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <svg viewBox="0 0 72 72" width={72} height={72} style={{ display: "block", flexShrink: 0 }}>
                    {(() => {
                      const r = 28, circ = 2 * Math.PI * r, off = circ * (1 - reliabilityScore / 100)
                      const col = reliabilityScore >= 90 ? C.accent : reliabilityScore >= 70 ? C.warn : C.red
                      return (<>
                        <circle cx="36" cy="36" r={r} fill="none" stroke={C.bg3} strokeWidth={8} />
                        <circle cx="36" cy="36" r={r} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 36 36)" />
                      </>)
                    })()}
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 20, color: C.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                      {reliabilityScore}<span style={{ fontSize: 11, color: C.ink3, fontWeight: 500 }}>/100</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 3 }}>
                      {reliabilityScore >= 90 ? "Proveedor fiable · riesgo bajo" : reliabilityScore >= 70 ? "Fiabilidad media" : "Atención requerida"}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  {[
                    { k: "Estado operativo", v: p.operationalState === "OK" ? "Activo" : p.operationalState === "PAUSED" ? "Pausado" : "Incidencia", tone: p.operationalState === "OK" ? C.accentInk : C.warn },
                    { k: "Dependencia",       v: DEP_LABELS[p.dependencyLevel] ?? p.dependencyLevel, tone: ["HIGH","CRITICAL"].includes(p.dependencyLevel) ? C.red : C.ink2 },
                    { k: "Criticidad",        v: p.isCritical ? "Proveedor preferente" : "No crítico", tone: p.isCritical ? C.warn : C.ink3 },
                    { k: "Alternativa",       v: p.hasAlternative ? "Sí disponible" : p.hasAlternative === false ? "Sin alternativa" : "No indicado", tone: p.hasAlternative ? C.accentInk : p.hasAlternative === false ? C.red : C.ink3 },
                  ].map(row => (
                    <div key={row.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.line3}`, fontSize: 12 }}>
                      <span style={{ color: C.ink3 }}>{row.k}</span>
                      <span style={{ fontWeight: 600, color: row.tone, fontFamily: "ui-monospace,monospace", fontSize: 11.5 }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Condiciones comerciales */}
            <div style={rcard}>
              <div style={rcardHead}>
                <h4 style={rcardLabel}>Condiciones comerciales</h4>
              </div>
              <div style={rcardBody}>
                {[
                  { k: "Tipo proveedor", v: typeLabel },
                  { k: "Coste mensual",  v: p.monthlyCost ? fmtEur(p.monthlyCost) : "—" },
                  { k: "Área afectada",  v: p.affectedArea ?? "—" },
                  { k: "Alternativa",    v: p.hasAlternative ? "Sí" : p.hasAlternative === false ? "No" : "—" },
                ].map(row => (
                  <div key={row.k} style={{ display: "grid", gridTemplateColumns: "86px 1fr", gap: "6px 12px", padding: "7px 0", borderTop: `1px solid ${C.line3}`, alignItems: "baseline", fontSize: 12 }}>
                    <span style={infoKey}>{row.k}</span>
                    <span style={{ fontWeight: 550, color: C.ink, letterSpacing: "-0.003em" }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas rápidas */}
            <div style={rcard}>
              <div style={rcardHead}>
                <h4 style={rcardLabel}>Notas</h4>
                <button onClick={() => setTab("notas")} style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, cursor: "pointer", padding: "3px 7px", borderRadius: 5, background: "none", border: "none" }}>Ver todas</button>
              </div>
              <div style={rcardBody}>
                {p.notes ? (
                  <p style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.5, margin: 0 }}>{p.notes}</p>
                ) : (
                  <p style={{ fontSize: 12, color: C.ink4, fontStyle: "italic", margin: 0 }}>
                    Sin notas.{" "}
                    <button onClick={() => setTab("notas")} style={{ color: C.accentInk, fontWeight: 550, fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Añadir nota</button>
                  </p>
                )}
              </div>
            </div>

            {/* Tareas */}
            <div style={rcard}>
              <div style={rcardHead}>
                <h4 style={rcardLabel}>Tareas</h4>
                <span style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace" }}>{pendingTasks} abiertas</span>
              </div>
              <div style={rcardBody}>
                {pendingTasks === 0 ? (
                  <p style={{ fontSize: 12, color: C.ink4, fontStyle: "italic", margin: 0 }}>Sin tareas pendientes.</p>
                ) : (
                  <p style={{ fontSize: 12.5, color: C.ink2, margin: 0 }}>{pendingTasks} {pendingTasks === 1 ? "tarea pendiente" : "tareas pendientes"} para este proveedor.</p>
                )}
                <button onClick={() => setTab("notas")} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, color: C.accentInk, fontWeight: 550, cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "inherit" }}>
                  <Plus size={11} />Nueva tarea
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
