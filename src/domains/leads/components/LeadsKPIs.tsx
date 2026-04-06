"use client"


export type KpisData = {
  total: number
  hot: number
  converted: number
  stalled: number
  newThisWeek?: number
  hotDelta?: number
  conversionRate?: number
}

export type LeadsKPIsProps = {
  kpis: KpisData
  activeKpi?: string | null
  onKpiClick?: (key: string) => void
}

function DeltaText({ value, suffix, invert }: { value: number; suffix: string; invert?: boolean }) {
  const isPositive = value > 0
  const isNegative = value < 0
  const color = invert
    ? isPositive ? "#E24B4A" : isNegative ? "#1FA97A" : "var(--text-secondary)"
    : isPositive ? "#1FA97A" : isNegative ? "#E24B4A" : "var(--text-secondary)"
  const prefix = isPositive ? "+" : ""
  return (
    <span style={{ color, fontWeight: 500 }}>
      {prefix}{value} {suffix}
    </span>
  )
}

function RateText({ value, suffix }: { value: number; suffix: string }) {
  const color = value > 0 ? "#1FA97A" : "var(--text-secondary)"
  return (
    <span style={{ color, fontWeight: 500 }}>
      {value}% {suffix}
    </span>
  )
}

const cards = [
  {
    key: "total" as const,
    label: "TOTAL LEADS",
    renderSub: (kpis: KpisData) => <DeltaText value={kpis.newThisWeek ?? 0} suffix="esta semana" />,
    filter: (p: URLSearchParams) => {
      p.delete("temperature"); p.delete("showConverted"); p.delete("showLost")
      p.delete("stale"); p.delete("status")
    },
  },
  {
    key: "hot" as const,
    label: "POTENCIALES",
    renderSub: (kpis: KpisData) => <DeltaText value={kpis.hotDelta ?? 0} suffix="respecto ayer" />,
    filter: (p: URLSearchParams) => {
      p.set("temperature", "HOT")
      p.delete("showConverted"); p.delete("showLost"); p.delete("stale"); p.delete("status")
    },
  },
  {
    key: "converted" as const,
    label: "CONVERTIDOS",
    renderSub: (kpis: KpisData) => <RateText value={kpis.conversionRate ?? 0} suffix="este mes" />,
    filter: (p: URLSearchParams) => {
      p.set("status", "CONVERTED"); p.set("showConverted", "true")
      p.delete("temperature"); p.delete("showLost"); p.delete("stale")
    },
  },
  {
    key: "stalled" as const,
    label: "ESTANCADOS",
    renderSub: (kpis: KpisData) => <DeltaText value={kpis.stalled} suffix="sin actividad >7d" invert />,
    filter: (p: URLSearchParams) => {
      p.set("stale", "true")
      p.delete("temperature"); p.delete("showConverted"); p.delete("showLost"); p.delete("status")
    },
  },
]

export function LeadsKPIs({ kpis, activeKpi, onKpiClick }: LeadsKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const active = activeKpi === card.key
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onKpiClick?.(card.key)}
            style={{
              background: active ? "rgba(31,169,122,0.06)" : "var(--bg-card)",
              border: active ? "1px solid #1FA97A" : "0.5px solid var(--border-subtle)",
              boxShadow: active ? "0 0 0 3px rgba(31,169,122,0.10)" : "none",
              borderRadius: 12,
              padding: "20px 24px",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.15s, border 0.15s, box-shadow 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-surface)" }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "rgba(31,169,122,0.06)" : "var(--bg-card)" }}
          >
            {active && (
              <span style={{ position: "absolute", top: 10, right: 12, width: 6, height: 6, borderRadius: "50%", background: "#1FA97A" }} />
            )}
            <p style={{
              fontSize: 11,
              fontWeight: 500,
              color: active ? "#1FA97A" : "var(--text-secondary)",
              letterSpacing: "0.06em",
              margin: 0,
            }}>
              {card.label}
            </p>
            <p style={{
              fontSize: 32,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "4px 0 0",
              lineHeight: 1.1,
            }}>
              {kpis[card.key].toLocaleString()}
            </p>
            <div style={{
              height: 1,
              background: active ? "rgba(31,169,122,0.2)" : "var(--border-subtle)",
              margin: "12px 0",
            }} />
            <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>
              {card.renderSub(kpis)}
            </p>
          </button>
        )
      })}
    </div>
  )
}
