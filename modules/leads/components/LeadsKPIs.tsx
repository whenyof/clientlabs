"use client"

import { Users, Flame, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export type LeadsKPIsProps = {
  kpis: {
    total: number
    hot: number
    converted: number
    stalled: number
  }
}

const cards: { key: keyof LeadsKPIsProps["kpis"]; label: string; icon: typeof Users }[] = [
  { key: "total", label: "Total", icon: Users },
  { key: "hot", label: "Potenciales", icon: Flame },
  { key: "converted", label: "Convertidos", icon: CheckCircle },
  { key: "stalled", label: "Estancados", icon: AlertCircle },
]

export function LeadsKPIs({ kpis }: LeadsKPIsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "total") {
      params.delete("temperature")
      params.delete("showConverted")
      params.delete("showLost")
      params.delete("stale")
      params.delete("status")
    } else if (key === "hot") {
      params.set("temperature", "HOT")
      params.delete("showConverted")
      params.delete("showLost")
      params.delete("stale")
      params.delete("status")
    } else if (key === "converted") {
      params.set("showConverted", "true")
      params.set("status", "CONVERTED")
      params.delete("temperature")
      params.delete("stale")
    } else if (key === "stalled") {
      params.set("stale", "true")
      params.delete("temperature")
      params.delete("showConverted")
      params.delete("showLost")
      params.delete("status")
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleClick(key)}
          className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors h-auto"
        >
          <div>
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-0.5">
              {kpis[key].toLocaleString()}
            </p>
          </div>
          <Icon className="h-5 w-5 text-neutral-400 shrink-0" aria-hidden />
        </Button>
      ))}
    </div>
  )
}
