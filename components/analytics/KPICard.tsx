"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 96, h = 32
  const min = Math.min(...data), max = Math.max(...data)
  const r = max - min || 1
  const pts = data.map((v, i) => [+(((i / (data.length - 1)) * w).toFixed(2)), +(((h - ((v - min) / r) * (h - 4)) - 2).toFixed(2))])
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const area = `${line} L${w},${h} L0,${h}Z`
  const id = `sp${color.replace(/\W/g, "")}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="opacity-90">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface KPICardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  badge?: string
  badgeColor?: string
  sparkData?: number[]
  sparkColor?: string
  loading?: boolean
}

export function KPICard({ title, value, trend, trendLabel, badge, badgeColor = "#F59E0B", sparkData, sparkColor = "#1FA97A", loading }: KPICardProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col justify-between" style={{ minHeight: 148 }}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest leading-none">{title}</p>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0" style={{ background: badgeColor + "18", color: badgeColor }}>
            {badge}
          </span>
        )}
      </div>
      {loading
        ? <div className="h-9 w-28 bg-[var(--bg-surface)] rounded animate-pulse my-2" />
        : <p className="text-[32px] font-bold text-[var(--text-primary)] leading-none mt-2 tracking-tight">{value}</p>
      }
      <div className="flex items-end justify-between">
        {trend !== undefined
          ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: trend >= 0 ? "#1FA97A" : "#EF4444" }}>
              {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend > 0 ? "+" : ""}{trend}%{trendLabel && <span className="font-normal text-[var(--text-secondary)]"> {trendLabel}</span>}
            </span>
          )
          : <span />
        }
        {sparkData && sparkData.length > 1 && <SparkLine data={sparkData} color={sparkColor} />}
      </div>
    </div>
  )
}
