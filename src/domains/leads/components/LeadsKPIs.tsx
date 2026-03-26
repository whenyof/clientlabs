"use client"

import { useRouter, useSearchParams } from "next/navigation"

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
    filter: (p: URLSearchParams) => { p.delete("temperature"); p.delete("showConverted"); p.delete("stale") },
  },
  {
    key: "hot" as const,
    label: "POTENCIALES",
    renderSub: (kpis: KpisData) => <DeltaText value={kpis.hotDelta ?? 0} suffix="respecto ayer" />,
    filter: (p: URLSearchParams) => { p.set("temperature", "HOT"); p.delete("showConverted"); p.delete("stale") },
  },
  {
    key: "converted" as const,
    label: "CONVERTIDOS",
    renderSub: (kpis: KpisData) => <RateText value={kpis.conversionRate ?? 0} suffix="este mes" />,
    filter: (p: URLSearchParams) => { p.set("showConverted", "true"); p.delete("temperature"); p.delete("stale") },
  },
  {
    key: "stalled" as const,
    label: "ESTANCADOS",
    renderSub: (kpis: KpisData) => <DeltaText value={kpis.stalled} suffix="sin actividad >7d" invert />,
    filter: (p: URLSearchParams) => { p.set("stale", "true"); p.delete("temperature"); p.delete("showConverted") },
  },
]

export function LeadsKPIs({ kpis }: LeadsKPIsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (card: typeof cards[number]) => {
    const params = new URLSearchParams(searchParams.toString())
    card.filter(params)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() => handleClick(card)}
          style={{
            background: "var(--bg-card)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "left",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
        >
          <p style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-secondary)",
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
            background: "var(--border-subtle)",
            margin: "12px 0",
          }} />
          <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>
            {card.renderSub(kpis)}
          </p>
        </button>
      ))}
    </div>
  )
}
