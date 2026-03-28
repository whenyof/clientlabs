"use client"

import { useState, useEffect } from "react"
import { LeadsKPIs, type KpisData } from "@domains/leads/components/LeadsKPIs"

export function LeadsKpisClient({ initial }: { initial: KpisData }) {
  const [kpis, setKpis] = useState(initial)

  useEffect(() => {
    const fetchKpis = () => {
      fetch("/api/leads/kpis", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data: KpisData) => setKpis(data))
        .catch(() => {})
    }

    fetchKpis()
    const interval = setInterval(fetchKpis, 10000)
    return () => clearInterval(interval)
  }, [])

  return <LeadsKPIs kpis={kpis} />
}
