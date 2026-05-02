"use client"

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { ArrowLeft, Users, TrendingUp, MousePointerClick, Globe, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"

// ─── Source labels & colours ─────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, string> = {
  WEB: "Script web", MANUAL: "Manual", API: "API",
  WHATSAPP: "WhatsApp", FACEBOOK: "Meta Ads", INSTAGRAM: "Instagram",
  CALENDLY: "Calendly", CAL: "Cal.com", GMAIL: "Gmail",
  GOOGLE_ADS: "Google Ads", LINKEDIN: "LinkedIn", TIKTOK: "TikTok",
  ZAPIER: "Zapier", FORM: "Formulario", STRIPE: "Stripe", WEB_FORM: "Formulario web",
}
const PALETTE = ["#1FA97A","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#14B8A6","#F97316","#84CC16"]
const srcLabel = (s: string) => SOURCE_LABEL[s.toUpperCase()] ?? s
const srcColor = (i: number) => PALETTE[i % PALETTE.length]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  leadsBySource30d: { source: string; count: number }[]
  allTimeBySource: { source: string; count: number }[]
  timelineData: Record<string, string | number>[]
  sources: string[]
  sessions: number
  convertedCount: number
  totalLeads30d: number
  integrations: { provider: string; status: string; category: string; lastSync: string | null }[]
  sdkInstallations: { domain: string; lastSeenAt: string | null; lastEventAt: string | null; eventCount: number }[]
}

// ─── Tooltip custom ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8ED] rounded-lg shadow-sm px-3 py-2 text-xs min-w-[120px]">
      <p className="text-[#5F7280] font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-[#374151]">{srcLabel(p.dataKey)}</span>
          </span>
          <span className="font-semibold text-[#0B1F2A] tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: any; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8ED] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent ? `${accent}18` : "#F4F7F9" }}>
          <Icon className="w-4 h-4" style={{ color: accent ?? "#8FA6B2" }} />
        </div>
        <p className="text-xs font-medium text-[#8FA6B2] uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#0B1F2A] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#8FA6B2] mt-1">{sub}</p>}
    </div>
  )
}

// ─── Channel status row ──────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { label: string; desc: string }> = {
  web: { label: "Script web", desc: "SDK JavaScript" },
  whatsapp: { label: "WhatsApp Business", desc: "API oficial" },
  facebook: { label: "Meta Lead Ads", desc: "Facebook / Instagram" },
  gmail: { label: "Gmail", desc: "Google Workspace" },
  "google-calendar": { label: "Google Calendar", desc: "Sincronización" },
  calendly: { label: "Calendly", desc: "Webhook" },
  zapier: { label: "Zapier", desc: "6.000+ apps" },
  stripe: { label: "Stripe", desc: "Pagos" },
  slack: { label: "Slack", desc: "Notificaciones" },
  mailchimp: { label: "Mailchimp", desc: "Email marketing" },
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—"
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return "ahora"
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsView({
  leadsBySource30d, allTimeBySource, timelineData, sources,
  sessions, convertedCount, totalLeads30d, integrations, sdkInstallations,
}: Props) {
  const conversionRate = totalLeads30d > 0 ? Math.round((convertedCount / totalLeads30d) * 100) : 0
  const totalEvents = sdkInstallations.reduce((s, i) => s + i.eventCount, 0)
  const hasData = totalLeads30d > 0 || sessions > 0

  // Pie data — all-time leads by source
  const pieData = allTimeBySource.map((r, i) => ({
    name: srcLabel(r.source),
    value: r.count,
    color: srcColor(i),
  }))

  // Connected channels for status table
  const connectedProviders = new Set(
    integrations.filter((i) => i.status === "CONNECTED").map((i) => i.provider.toLowerCase())
  )
  const hasSdk = sdkInstallations.some((i) => i.lastSeenAt)
  if (hasSdk) connectedProviders.add("web")

  const allChannels = Object.entries(CHANNEL_META).map(([key, meta]) => ({
    key,
    ...meta,
    connected: connectedProviders.has(key),
    lastSync: integrations.find((i) => i.provider.toLowerCase() === key)?.lastSync ?? null,
  }))

  return (
    <section className="space-y-6 pb-12">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E2E8ED]">
        <div>
          <Link href="/dashboard/connect" className="inline-flex items-center gap-1.5 text-xs text-[#8FA6B2] hover:text-[#0B1F2A] transition-colors mb-1">
            <ArrowLeft className="w-3 h-3" /> Conexiones
          </Link>
          <h1 className="text-xl font-semibold text-[#0B1F2A]">Analíticas de captación</h1>
          <p className="text-sm text-[#5F7280] mt-0.5">Comparativa de todos los canales — últimos 30 días</p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Leads captados" value={totalLeads30d} sub="últimos 30 días" icon={Users} accent="#1FA97A" />
        <KpiCard label="Sesiones web" value={sessions.toLocaleString("es-ES")} sub="script de seguimiento" icon={MousePointerClick} accent="#3B82F6" />
        <KpiCard label="Convertidos" value={convertedCount} sub={`${conversionRate}% tasa conversión`} icon={TrendingUp} accent="#F59E0B" />
        <KpiCard label="Eventos SDK" value={totalEvents.toLocaleString("es-ES")} sub={`${sdkInstallations.length} dominio${sdkInstallations.length !== 1 ? "s" : ""}`} icon={Globe} accent="#8B5CF6" />
      </div>

      {/* Timeline chart */}
      <div className="bg-white rounded-xl border border-[#E2E8ED] p-5">
        <h2 className="text-sm font-semibold text-[#0B1F2A] mb-1">Evolución de leads por canal</h2>
        <p className="text-xs text-[#8FA6B2] mb-5">Últimos 30 días — acumulado diario por fuente</p>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-[#C8D6E0] text-sm">Sin datos aún</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {sources.map((src, i) => (
                  <linearGradient key={src} id={`grad-${src}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={srcColor(i)} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={srcColor(i)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F7" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8FA6B2" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#8FA6B2" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#5F7280" }}>{srcLabel(v)}</span>} />
              {sources.map((src, i) => (
                <Area key={src} type="monotone" dataKey={src} stroke={srcColor(i)} strokeWidth={2}
                  fill={`url(#grad-${src})`} dot={false} activeDot={{ r: 4 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar — leads por canal all-time */}
        <div className="bg-white rounded-xl border border-[#E2E8ED] p-5">
          <h2 className="text-sm font-semibold text-[#0B1F2A] mb-1">Leads por canal</h2>
          <p className="text-xs text-[#8FA6B2] mb-5">Total histórico — todos los canales</p>
          {allTimeBySource.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#C8D6E0] text-sm">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={allTimeBySource.map((r) => ({ ...r, label: srcLabel(r.source) }))}
                layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8FA6B2" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} width={90} />
                <Tooltip cursor={{ fill: "#F4F7F9" }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="bg-white border border-[#E2E8ED] rounded-lg shadow-sm px-3 py-2 text-xs">
                      <p className="font-semibold text-[#0B1F2A]">{payload[0].payload.label}</p>
                      <p className="text-[#5F7280]">{payload[0].value} leads</p>
                    </div>
                  )
                }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {allTimeBySource.map((_, i) => <Cell key={i} fill={srcColor(i)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie — distribución */}
        <div className="bg-white rounded-xl border border-[#E2E8ED] p-5">
          <h2 className="text-sm font-semibold text-[#0B1F2A] mb-1">Distribución por canal</h2>
          <p className="text-xs text-[#8FA6B2] mb-5">Proporción de leads históricos por fuente</p>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-[#C8D6E0] text-sm">Sin datos aún</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" strokeWidth={2} stroke="#fff">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8ED" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry) => {
                  const total = pieData.reduce((s, e) => s + e.value, 0)
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
                  return (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                      <span className="text-[11px] text-[#374151] flex-1 truncate">{entry.name}</span>
                      <span className="text-[11px] font-semibold text-[#0B1F2A] tabular-nums">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Channel status table */}
      <div className="bg-white rounded-xl border border-[#E2E8ED] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8ED]">
          <h2 className="text-sm font-semibold text-[#0B1F2A]">Estado de canales</h2>
          <p className="text-xs text-[#8FA6B2] mt-0.5">
            {connectedProviders.size} de {allChannels.length} canales conectados
          </p>
        </div>
        <div className="divide-y divide-[#F4F7F9]">
          {allChannels.map((ch) => (
            <div key={ch.key} className="flex items-center justify-between px-5 py-3 hover:bg-[#FAFCFD] transition-colors">
              <div className="flex items-center gap-3">
                {ch.connected
                  ? <CheckCircle2 className="w-4 h-4 text-[#1FA97A] flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-[#C8D6E0] flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-[#0B1F2A]">{ch.label}</p>
                  <p className="text-xs text-[#8FA6B2]">{ch.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {ch.connected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1FA97A] bg-[#E8F5EF] px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" /> Activo
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#8FA6B2] bg-[#F4F7F9] px-2 py-0.5 rounded-full">Sin conectar</span>
                )}
                {ch.lastSync && (
                  <span className="text-[10px] text-[#8FA6B2] hidden sm:flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {relativeTime(ch.lastSync)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
