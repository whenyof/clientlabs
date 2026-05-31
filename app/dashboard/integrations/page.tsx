"use client"

import { useState } from "react"
import { Plus, RefreshCw, FileText, Settings, Check, X, ExternalLink, MoreVertical } from "lucide-react"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", violet: "#6d28d9", cyan: "#0e7490",
}

type IntegItem = { ltr: string; color: string; nm: string; cat: string; desc: string; status?: string; lbl?: string; sub?: string; isNew?: boolean }

const CONNECTED: IntegItem[] = [
  { ltr: "G", color: C.ink,    nm: "Google Workspace",  cat: "Comunicación · Calendario",      desc: "Sincroniza calendario, correo y contactos del equipo.",   status: "on",   lbl: "Conectado",              sub: "12.4k eventos · 24 h" },
  { ltr: "S", color: C.accent, nm: "Stripe Pagos",       cat: "Facturación · Pagos",            desc: "Cobros automáticos, conciliación y exportación.",         status: "on",   lbl: "Conectado",              sub: "182 movimientos · 24 h" },
  { ltr: "S", color: C.violet, nm: "Slack",              cat: "Comunicación · Notificaciones",  desc: "Notificaciones de leads calientes, cobros y tareas.",     status: "on",   lbl: "Conectado",              sub: "Canal #ventas" },
  { ltr: "Z", color: C.warn,   nm: "Zapier",             cat: "Automatización · Conector",      desc: "Conecta ClientLabs con 5.000+ apps externas vía Zaps.",  status: "warn", lbl: "Reautoriza",             sub: "Token expira en 6 d" },
  { ltr: "H", color: C.blue,   nm: "HubSpot CRM",        cat: "Datos · Marketing",              desc: "Importa leads, sincroniza contactos y campañas.",         status: "on",   lbl: "Conectado",              sub: "182 contactos sync" },
  { ltr: "N", color: C.cyan,   nm: "Notion",             cat: "Documentación",                  desc: "Crea notas de cliente y proyecto desde tareas.",          status: "on",   lbl: "Conectado",              sub: "Workspace · Vega" },
  { ltr: "A", color: C.ink,    nm: "AEAT Verifactu",     cat: "Facturación · Regulación",       desc: "Firma y envía facturas al sistema Verifactu AEAT.",       status: "on",   lbl: "Conectado",              sub: "142 envíos · OK" },
  { ltr: "C", color: C.accent, nm: "Claude AI",          cat: "IA · Asistente",                 desc: "Motor de IA para resúmenes, redacción y consultas.",      status: "on",   lbl: "Conectado",              sub: "238 / 2.000 msgs" },
  { ltr: "T", color: C.warn,   nm: "Twilio SMS",         cat: "Comunicación · SMS",             desc: "SMS para recordatorios y avisos de pago.",                status: "on",   lbl: "Conectado",              sub: "84 SMS · 24 h" },
  { ltr: "G", color: C.blue,   nm: "GitHub",             cat: "Producto · Tickets",             desc: "Vincula tareas con issues y pull-requests.",              status: "on",   lbl: "Conectado",              sub: "Repo: vega-suite" },
  { ltr: "M", color: C.violet, nm: "Mailchimp",          cat: "Marketing · Email",              desc: "Crea audiencias desde segmentos de clientes.",            status: "warn", lbl: "1 lista desincronizada", sub: "Última sync ayer" },
  { ltr: "Q", color: C.cyan,   nm: "QuickBooks",         cat: "Contabilidad",                   desc: "Exporta libro mayor, IVA y gastos al ERP.",              status: "on",   lbl: "Conectado",              sub: "Conexión: estable" },
]

const MARKETPLACE: IntegItem[] = [
  { ltr: "C", color: C.warn,   nm: "Calendly",           cat: "Calendario",   desc: "Reserva de citas automáticas para tu equipo comercial.", isNew: true },
  { ltr: "I", color: C.blue,   nm: "Intercom",           cat: "Soporte",      desc: "Chat de soporte y bandeja unificada con tu CRM." },
  { ltr: "L", color: C.ink,    nm: "LinkedIn Sales",     cat: "Ventas",       desc: "Importa prospects desde Sales Navigator." },
  { ltr: "X", color: C.accent, nm: "Xero",               cat: "Contabilidad", desc: "Conciliación bancaria + libro mayor multinacional.", isNew: true },
  { ltr: "M", color: C.violet, nm: "Meta Ads",           cat: "Marketing",    desc: "Atribución de leads desde campañas Facebook / Instagram." },
  { ltr: "G", color: C.warn,   nm: "Google Ads",         cat: "Marketing",    desc: "Atribuye conversiones y cierra el loop de ROAS." },
  { ltr: "W", color: C.cyan,   nm: "WhatsApp Business",  cat: "Mensajería",   desc: "Conversaciones de cliente integradas en el CRM.", isNew: true },
  { ltr: "S", color: C.violet, nm: "Shopify",            cat: "eCommerce",    desc: "Sincroniza pedidos, devoluciones y clientes." },
  { ltr: "Z", color: C.accent, nm: "Zoom",               cat: "Reuniones",    desc: "Crea reuniones desde el calendario y graba con IA." },
  { ltr: "S", color: C.ink,    nm: "Snowflake",          cat: "Datos · BI",   desc: "Exporta el data warehouse en tiempo casi-real.", isNew: true },
  { ltr: "S", color: C.blue,   nm: "SAP Business One",   cat: "ERP",          desc: "Sincroniza maestros de clientes y artículos." },
  { ltr: "T", color: C.ink,    nm: "Teams",              cat: "Comunicación", desc: "Notificaciones del workspace en tus canales." },
]

const WEBHOOKS = [
  { ok: true,  nm: "Lead nuevo → Stripe customer",     url: "hooks.estudiovega.io/leads/new",    ms: "POST", code: "200 OK", tm: "hace 4 min"  },
  { ok: true,  nm: "Factura pagada → Slack #ventas",   url: "hooks.estudiovega.io/slack/paid",   ms: "POST", code: "200 OK", tm: "hace 12 min" },
  { ok: true,  nm: "Nueva tarea → Calendar event",     url: "hooks.estudiovega.io/cal/task",     ms: "POST", code: "201",    tm: "hace 28 min" },
  { ok: false, nm: "Cobro recibido → Mailchimp",       url: "api.mailchimp.com/3.0/lists",        ms: "POST", code: "401",    tm: "hace 1h"     },
  { ok: true,  nm: "Factura emitida → Verifactu AEAT", url: "aeat.es/verifactu/firma",            ms: "POST", code: "200 OK", tm: "hace 1h"     },
  { ok: true,  nm: "Lead caliente → Slack #leads",     url: "hooks.estudiovega.io/slack/hot",    ms: "POST", code: "200 OK", tm: "hace 2h"     },
  { ok: true,  nm: "Cliente nuevo → HubSpot contact",  url: "api.hubapi.com/contacts/v1",         ms: "PUT",  code: "204",    tm: "hace 3h"     },
]

const CATS = ["Todas", "Conectadas", "Facturación + Pagos", "Comunicación", "Automatización", "Datos + BI", "IA"]

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div style={{ width: 28, height: 16, borderRadius: 99, background: on ? C.accent : C.ink5, position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .15s ease" }}>
      <div style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: 99, background: "white", transition: "left .15s ease" }} />
    </div>
  )
}

function IntegCard({ item, isConnected }: { item: IntegItem; isConnected: boolean }) {
  const statusColor = item.status === "warn" ? C.warn : C.accent
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color, color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0, position: "relative" }}>
          {item.ltr}
          {item.isNew && (
            <span style={{ position: "absolute", top: -6, right: -6, background: C.accent, color: "white", fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 99, letterSpacing: "0.04em" }}>NEW</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 550, fontSize: 13, color: C.ink, letterSpacing: "-0.005em" }}>{item.nm}</div>
          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, marginTop: 1 }}>{item.cat}</div>
        </div>
        {isConnected && <ToggleSwitch on={item.status === "on"} />}
      </div>
      <p style={{ fontSize: 12, color: C.ink3, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        {isConnected ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: statusColor }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: statusColor, display: "inline-block" }} />
            {item.lbl} · {item.sub}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: C.ink3 }}>No conectada</span>
        )}
        {isConnected ? (
          <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", background: C.bg2, border: `1px solid ${C.line}`, cursor: "pointer", color: C.ink3 }}>
            <Settings size={12} strokeWidth={1.8} />
          </button>
        ) : (
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
            Conectar
          </button>
        )}
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const [activeCat, setActiveCat] = useState("Todas")
  const activeCount = CONNECTED.filter(c => c.status === "on").length
  const warnCount = CONNECTED.filter(c => c.status === "warn").length

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Integraciones</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>{CONNECTED.length} integraciones activas</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              34,8k eventos sincronizados · 24 h
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>{MARKETPLACE.length + CONNECTED.length} apps disponibles</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <FileText size={12} strokeWidth={2} />API &amp; Webhooks
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <RefreshCw size={12} strokeWidth={2} />Sincronizar todo
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Conectar app
          </button>
        </div>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 20, overflow: "hidden" }}>
        {[
          { label: "Integraciones activas", value: String(CONNECTED.length),                             sub: "+2 este mes" },
          { label: "Eventos sincronizados",  value: "34,8k",                                              sub: "últimas 24 h" },
          { label: "Webhooks operativos",    value: String(WEBHOOKS.filter(w => w.ok).length),            sub: `${WEBHOOKS.filter(w => !w.ok).length} error hoy` },
          { label: "Apps disponibles",       value: String(MARKETPLACE.length + CONNECTED.length),        sub: "30 nuevas en 2026" },
        ].map((k, i, arr) => (
          <div key={k.label} style={{ padding: "18px 22px", borderRight: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
            <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, fontVariantNumeric: "tabular-nums", color: C.ink }}>{k.value}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, marginTop: 8 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY FILTER ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 20, paddingBottom: 2 }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: "5px 12px", borderRadius: 99, whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: `1px solid ${activeCat === cat ? C.ink : C.line}`, background: activeCat === cat ? C.ink : C.bg, color: activeCat === cat ? "white" : C.ink2 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── CONNECTED APPS ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: "-0.015em" }}>Conectadas en tu workspace</h2>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{activeCount} activas · {warnCount} requieren atención</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONNECTED.map(item => <IntegCard key={item.nm} item={item} isConnected />)}
        </div>
      </div>

      {/* ── WEBHOOKS ────────────────────────────────────────────── */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}` }}>
          <div>
            <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>Webhooks del workspace</h3>
            <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{WEBHOOKS.length} endpoints · 1 con error · 24 h</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>Documentación API <ExternalLink size={11} /></a>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
              <Plus size={11} strokeWidth={2.5} />Nuevo webhook
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 700 }}>
            <div style={{ display: "grid", gridTemplateColumns: "22px 1.6fr 1fr 80px 90px 100px 30px", gap: 14, padding: "10px 18px", background: C.bg2, borderBottom: `1px solid ${C.line2}`, fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: C.ink3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <span /><span>Evento → destino</span><span>URL</span><span style={{ textAlign: "center" }}>Método</span><span style={{ textAlign: "center" }}>Estado</span><span style={{ textAlign: "right" }}>Última</span><span />
            </div>
            {WEBHOOKS.map((w, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1.6fr 1fr 80px 90px 100px 30px", gap: 14, padding: "12px 18px", borderBottom: i < WEBHOOKS.length - 1 ? `1px solid ${C.line3}` : "none", alignItems: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: 99, background: w.ok ? C.accentSoft : "#fef2f2", display: "grid", placeItems: "center", color: w.ok ? C.accentInk : C.red }}>
                  {w.ok ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={2.5} />}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 550, color: C.ink, letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.nm}</span>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.url}</span>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink2, textAlign: "center" }}>{w.ms}</span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: w.ok ? C.accentSoft : "#fef2f2", color: w.ok ? C.accentInk : C.red }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: w.ok ? C.accentInk : C.red, display: "inline-block" }} />
                    {w.code}
                  </span>
                </div>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{w.tm}</span>
                <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: C.ink3, background: "none", border: "none", cursor: "pointer" }}>
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MARKETPLACE ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: "-0.015em" }}>Marketplace</h2>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>Descubre {MARKETPLACE.length + CONNECTED.length} integraciones · 12 nuevas este mes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MARKETPLACE.map(item => <IntegCard key={item.nm} item={item} isConnected={false} />)}
        </div>
      </div>

      {/* ── API BANNER ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 10, border: `1px solid ${C.accentSoft}`, background: `linear-gradient(180deg, rgba(236,246,241,0.6) 0%, white 100%)` }}>
        <div style={{ width: 38, height: 38, borderRadius: 8, background: "white", border: `1px solid ${C.accentSoft}`, display: "grid", placeItems: "center", color: C.accentInk, flexShrink: 0 }}>
          <FileText size={18} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>¿No encuentras tu herramienta? Usa la API pública</h4>
          <p style={{ margin: 0, fontSize: 12, color: C.ink3 }}>
            REST + Webhooks <strong style={{ color: C.ink }}>v2.4</strong> · 240+ endpoints · OAuth 2.0 · rate limit 5.000 req/min. Documentación completa, SDKs y colección de Postman.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
            <FileText size={11} />Ver docs
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, background: C.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>
            <Plus size={11} />Crear token API
          </button>
        </div>
      </div>
    </div>
  )
}
