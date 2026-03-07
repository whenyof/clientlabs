"use client"

import { motion } from "framer-motion"
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline"

export type KpiVariant = "emerald" | "red" | "violet" | "blue"

const CARD_TINT: Record<KpiVariant, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  red: "bg-red-500/10 border-red-500/20",
  violet: "bg-violet-500/10 border-violet-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
}

const VALUE_COLOR: Record<KpiVariant, string> = {
  emerald: "text-emerald-400",
  red: "text-red-400",
  violet: "text-violet-400",
  blue: "text-blue-400",
}

export interface FinanceStatCardProps {
  index?: number
  label: string
  value: string
  variant: KpiVariant
  delta?: string
  deltaUp?: boolean | null
  tooltip?: string
}

export function FinanceStatCard({
  index = 0,
  label,
  value,
  variant,
  delta,
  deltaUp = null,
  tooltip,
}: FinanceStatCardProps) {
  const tint = CARD_TINT[variant]
  const valueColor = VALUE_COLOR[variant]
  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`relative min-w-0 rounded-xl border backdrop-blur-sm ${tint} p-4 h-[100px] flex flex-col justify-between`}
      title={tooltip}
    >
      <p className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-secondary)] truncate">
        {label}
      </p>
      <p className={`text-xl font-bold tracking-tight tabular-nums truncate ${valueColor}`}>
        {value}
      </p>
      {(delta != null || deltaUp != null) && (
        <p
          className={`text-[11px] font-medium truncate flex items-center gap-0.5 ${
            deltaUp === true
              ? "text-emerald-400/90"
              : deltaUp === false
                ? "text-red-400/90"
                : "text-[var(--text-secondary)]"
          }`}
        >
          {deltaUp === true && <ArrowTrendingUpIcon className="w-3 h-3 shrink-0" aria-hidden />}
          {deltaUp === false && <ArrowTrendingDownIcon className="w-3 h-3 shrink-0" aria-hidden />}
          {delta ?? "—"}
        </p>
      )}
    </motion.article>
  )
}
