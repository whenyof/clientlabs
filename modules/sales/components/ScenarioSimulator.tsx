"use client"

import { useState, useMemo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency } from "../utils"
import {
  calculateScenario,
  type BaseMetrics,
  type ScenarioInputs,
  type ScenarioResult,
} from "../lib/scenarioEngine"

const DEFAULT_INPUTS: ScenarioInputs = {
  extraSales: 0,
  ticketChangePct: 0,
  convertedLeads: 0,
  reactivatedClients: 0,
  discountPct: 0,
}

type Props = {
  baseMetrics: BaseMetrics
}

export function ScenarioSimulator({ baseMetrics }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels?.sales

  const [inputs, setInputs] = useState<ScenarioInputs>(DEFAULT_INPUTS)

  const result = useMemo<ScenarioResult>(
    () => calculateScenario(baseMetrics, inputs),
    [baseMetrics, inputs]
  )

  const updateInput = (key: keyof ScenarioInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const hasGoal = baseMetrics.monthlyGoal != null && baseMetrics.monthlyGoal > 0
  const goalPct = Math.min(100, result.goalCompletionPct)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-4">
        {sl?.scenarios?.title ?? "Simulador de escenarios"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <InputRow
          label={sl?.scenarios?.extraSales ?? "Ventas extra"}
          value={inputs.extraSales}
          onChange={(v) => updateInput("extraSales", v)}
        />
        <InputRow
          label={sl?.scenarios?.ticketChange ?? "Cambio ticket %"}
          value={inputs.ticketChangePct}
          onChange={(v) => updateInput("ticketChangePct", v)}
          suffix="%"
          min={-100}
        />
        <InputRow
          label={sl?.scenarios?.convertedLeads ?? "Leads convertidos"}
          value={inputs.convertedLeads}
          onChange={(v) => updateInput("convertedLeads", v)}
        />
        <InputRow
          label={sl?.scenarios?.reactivated ?? "Clientes reactivados"}
          value={inputs.reactivatedClients}
          onChange={(v) => updateInput("reactivatedClients", v)}
        />
        <InputRow
          label={sl?.scenarios?.discount ?? "Descuento %"}
          value={inputs.discountPct}
          onChange={(v) => updateInput("discountPct", v)}
          suffix="%"
        />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs text-white/50">
            {sl?.scenarios?.projectedRevenue ?? "Ingreso proyectado"}
          </span>
          <span className="text-lg font-semibold text-white tabular-nums">
            {formatSaleCurrency(result.projectedRevenue)}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs text-white/50">
            {sl?.scenarios?.growth ?? "Crecimiento"}
          </span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              result.growthPct >= 0 ? "text-violet-400" : "text-red-400/90"
            )}
          >
            {result.growthPct >= 0 ? "+" : ""}
            {result.growthPct}%
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-xs text-white/50">
            {sl?.scenarios?.projectedSales ?? "Ventas proyectadas"}
          </span>
          <span className="text-lg font-semibold text-white tabular-nums">
            {result.projectedSales}
          </span>
        </div>

        {hasGoal && (
          <>
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-baseline gap-2 mb-1.5">
                <span className="text-xs text-white/50">
                  {sl?.scenarios?.goalCompletion ?? "Cumplimiento objetivo"}
                </span>
                <span className="text-sm font-medium text-white tabular-nums">
                  {result.goalCompletionPct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300",
                    result.goalCompletionPct >= 100
                      ? "bg-violet-500"
                      : "bg-amber-500/80"
                  )}
                  style={{ width: `${goalPct}%` }}
                />
              </div>
            </div>
            {result.neededSalesToGoal > 0 && (
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-white/50">
                  {sl?.scenarios?.neededSales ?? "Ventas necesarias para objetivo"}
                </span>
                <span className="text-base font-semibold text-violet-400 tabular-nums">
                  {Math.ceil(result.neededSalesToGoal)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function InputRow({
  label,
  value,
  onChange,
  suffix = "",
  min = 0,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  min?: number
}) {
  const display = value === 0 ? "" : String(value)
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={min}
          step={suffix === "%" ? 1 : 1}
          value={display}
          onChange={(e) => {
            const v = parseFloat(e.target.value.replace(",", "."))
            onChange(Number.isNaN(v) ? 0 : v)
          }}
          className="flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        {suffix ? (
          <span className="text-xs text-white/40 shrink-0">{suffix}</span>
        ) : null}
      </div>
    </div>
  )
}
