"use client"

import { useQuery } from "@tanstack/react-query"
import { Clock } from "lucide-react"

type TimeSavedData = {
  minutes: number
  hours: number
  invoices: number
  leads: number
  quotes: number
}

export function TimeSavedWidget() {
  const { data } = useQuery<TimeSavedData>({
    queryKey: ["time-saved"],
    queryFn: () => fetch("/api/onboarding/time-saved").then((r) => r.json()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 120_000,
  })

  if (!data || data.minutes === 0) return null

  return (
    <div
      className="rounded-xl p-4 mb-4 flex items-center gap-3"
      style={{ background: "linear-gradient(135deg, #1FA97A, #17896a)" }}
    >
      <Clock className="h-8 w-8 shrink-0" style={{ color: "rgba(255,255,255,0.7)" }} />
      <div>
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.8)" }}>Tiempo ahorrado con ClientLabs</p>
        <p className="text-[18px] font-bold text-white leading-tight">{data.hours} horas</p>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>
          {data.invoices} facturas · {data.leads} leads · {data.quotes} presupuestos generados
        </p>
      </div>
    </div>
  )
}
