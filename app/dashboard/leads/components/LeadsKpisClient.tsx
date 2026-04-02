"use client"

import { useState, useEffect } from "react"
import { LeadsKPIs, type KpisData } from "@domains/leads/components/LeadsKPIs"

export function LeadsKpisClient({ initial }: { initial: KpisData }) {
  const [kpis, setKpis] = useState(initial)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch("/api/leads/kpis", { cache: "no-store" })
        if (!res.ok) return
        const data: KpisData = await res.json()
        setKpis(data)
      } catch {
        return
      }
    }

    fetchKpis()
    const interval = setInterval(fetchKpis, 300_000)
    return () => clearInterval(interval)
  }, [])

  return <LeadsKPIs kpis={kpis} />
}
