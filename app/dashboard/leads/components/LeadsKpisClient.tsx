"use client"

import { useState, useEffect } from "react"
import { LeadsKPIs } from "@domains/leads/components/LeadsKPIs"

type Kpis = { total: number; hot: number; converted: number; stalled: number }

export function LeadsKpisClient({ initial }: { initial: Kpis }) {
  const [kpis, setKpis] = useState(initial)

  useEffect(() => {
    const fetchKpis = () => {
      fetch("/api/leads/kpis", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data: Kpis) => setKpis(data))
        .catch(() => {})
    }

    const interval = setInterval(fetchKpis, 10000)
    return () => clearInterval(interval)
  }, [])

  return <LeadsKPIs kpis={kpis} />
}
