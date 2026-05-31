"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Plus, Shield } from "lucide-react"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { OverdueAlert } from "./components/OverdueAlert"
import { TrimestralAlert } from "./components/TrimestralAlert"
import dynamic from "next/dynamic"
const MainChart = dynamic(() => import("./components/MainChart").then(m => ({ default: m.MainChart })), { ssr: false })
const ClientRevenueChart = dynamic(() => import("./components/ClientRevenueChart").then(m => ({ default: m.ClientRevenueChart })), { ssr: false })
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { Forecast } from "./components/Forecast"
import type { FinancePageData } from "./lib/server-data"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c",
}

// ─── Finance subnav tabs ────────────────────────────────────────────────────
const TABS = [
  { id: "resumen",     label: "Resumen",              href: "/dashboard/finance",               count: null },
  { id: "facturas",    label: "Facturas emitidas",    href: "/dashboard/finance/facturas",       count: null },
  { id: "presupuestos",label: "Presupuestos",         href: "/dashboard/finance/presupuestos",   count: null },
  { id: "albaranes",   label: "Albaranes",            href: "/dashboard/finance/albaranes",      count: null },
  { id: "pedidos",     label: "Pedidos",              href: "/dashboard/finance/pedidos",        count: null },
  { id: "cobros",      label: "Cobros",               href: "/dashboard/finance/cobros",         count: null },
  { id: "gastos",      label: "Gastos · compras",     href: "/dashboard/finance/gastos",         count: null },
  { id: "productos",   label: "Productos · servicios",href: "/dashboard/finance/productos",      count: null },
  { id: "configuracion",label: "Configuración",       href: "/dashboard/finance/configuracion",  count: null },
]

// ─── Props ─────────────────────────────────────────────────────────────────
type Props = {
  initialData: FinancePageData
  period: string
  view?: string
  billingNode: React.ReactNode
  purchasesNode?: React.ReactNode
}

// ─── Fiscal summary (kept from original) ───────────────────────────────────
function FiscalSummary({ initialData }: { initialData: FinancePageData }) {
  const kpis = initialData.analytics.kpis
  const ivaSoportado = Math.abs(kpis.totalExpenses) * 0.21
  const ivaRepercutido = kpis.totalIncome * 0.21
  const ivaDeclarar = ivaRepercutido - ivaSoportado
  const irpfRetenido = kpis.totalIncome * 0.15

  const items = [
    { label: "IVA repercutido", value: ivaRepercutido, tone: "green" },
    { label: "IVA soportado",   value: ivaSoportado,   tone: "red"   },
    { label: "IVA a declarar",  value: ivaDeclarar,    tone: ivaDeclarar >= 0 ? "amber" : "green" },
    { label: "IRPF retenido",   value: irpfRetenido,   tone: "blue"  },
  ]

  const toneDot: Record<string, string> = {
    green: C.accent, red: "#b91c1c", amber: C.warn, blue: "#3756a4",
  }

  const eurFmt = new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  })

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: "-0.012em", margin: 0 }}>
          Resumen fiscal trimestral
        </h3>
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          estimaciones automáticas
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{ border: `1px solid ${C.line2}`, borderRadius: 8, padding: "12px 16px", background: C.bg2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: toneDot[item.tone], display: "inline-block" }} />
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: C.ink4 }}>
                {item.label}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {eurFmt.format(item.value)}
            </div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, marginTop: 4 }}>estimado</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Financial summary tab (main content) ──────────────────────────────────
function FinancialSummaryTab({ initialData }: { initialData: FinancePageData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <MainChart />
        <ClientRevenueChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CashflowBlock />
        <BusinessHealth />
        <Forecast />
      </div>
      <CFOInsights />
      <FiscalSummary initialData={initialData} />
    </div>
  )
}

// ─── Verifactu compliance banner ────────────────────────────────────────────
function VerifactuBanner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 18px", borderRadius: 10,
      border: `1px solid ${C.accentSoft}`,
      background: `linear-gradient(180deg, rgba(236,246,241,0.6) 0%, white 100%)`,
      marginBottom: 16,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: "white", border: `1px solid ${C.accentSoft}`,
        display: "grid", placeItems: "center", color: C.accentInk, flexShrink: 0,
      }}>
        <Shield size={18} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
          Cumplimiento Verifactu · AEAT operativo
        </h4>
        <p style={{ margin: 0, fontSize: 12, color: C.ink3 }}>
          Últimos <strong style={{ color: C.ink }}>142 envíos</strong> firmados con SHA-256 y encadenados al registro anterior. Cero rechazos.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
          Verificar último
        </button>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>
          Ver registro
        </button>
      </div>
    </div>
  )
}

// ─── Main FinanceView ───────────────────────────────────────────────────────
export function FinanceView({ initialData, period }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSetPeriod = (nextPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", nextPeriod)
    router.push(`/dashboard/finance?${params.toString()}`)
  }

  const handleRefetch = () => {
    router.refresh()
  }

  // Determine active tab
  const activeTab = TABS.find(t =>
    t.href === pathname || (pathname !== "/dashboard/finance" && pathname.startsWith(t.href + "/"))
  )?.id ?? "resumen"

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 0, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`,
      }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
            Facturación
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>Mayo 2026 · día {new Date().getDate()} de 31</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              Verifactu activo · 142 envíos AEAT
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Próximo: 20 jun · Mod. 349</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {["7d", "30d", "MTD", "QTD", "YTD"].map((p, i) => (
              <button
                key={p}
                onClick={() => handleSetPeriod(p.toLowerCase())}
                style={{
                  padding: "4px 10px", borderRadius: 5,
                  fontFamily: "ui-monospace,monospace", fontSize: 11.5,
                  color: period === p.toLowerCase() || (i === 2 && period === "month") ? C.ink : C.ink3,
                  fontWeight: 500,
                  background: period === p.toLowerCase() || (i === 2 && period === "month") ? "white" : "transparent",
                  boxShadow: period === p.toLowerCase() || (i === 2 && period === "month")
                    ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)`
                    : "none",
                  border: "none", cursor: "pointer",
                }}
              >{p}</button>
            ))}
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <FileText size={12} strokeWidth={2} />Exportar libro
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Nueva factura
          </button>
        </div>
      </div>

      {/* ── SUBNAV TABS ──────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${C.line2}`,
        display: "flex", alignItems: "center", gap: 2,
        overflowX: "auto", scrollbarWidth: "none",
        margin: "0 -28px", padding: "0 28px",
      }}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "12px 12px 11px",
                fontSize: 12.5, color: isActive ? C.ink : C.ink3, fontWeight: isActive ? 600 : 500,
                whiteSpace: "nowrap",
                borderBottom: `2px solid ${isActive ? C.ink : "transparent"}`,
                textDecoration: "none",
                letterSpacing: "-0.003em",
                transition: "color .12s ease, border-color .12s ease",
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  fontFamily: "ui-monospace,monospace", fontSize: 10,
                  padding: "1px 5px", borderRadius: 99,
                  background: isActive ? C.ink : C.bg3,
                  color: isActive ? "white" : C.ink3, fontWeight: 500,
                }}>
                  {tab.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div style={{ paddingTop: 24 }}>
        <FinanceDataProvider
          initialAnalytics={initialData.analytics}
          initialMovements={initialData.movements}
          period={period}
          onSetPeriod={handleSetPeriod}
          onRefetch={handleRefetch}
        >
          {/* Verifactu compliance banner */}
          <VerifactuBanner />

          {/* Trimestral alert */}
          <div style={{ marginBottom: 16 }}>
            <TrimestralAlert />
          </div>

          {/* KPIs */}
          <div style={{ marginBottom: 16 }}>
            <FinanceKPIs />
          </div>

          {/* Overdue alert */}
          <div style={{ marginBottom: 16 }}>
            <OverdueAlert />
          </div>

          {/* Main content */}
          <FinancialSummaryTab initialData={initialData} />
        </FinanceDataProvider>
      </div>
    </div>
  )
}
