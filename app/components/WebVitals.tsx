"use client"

import { useEffect } from "react"

type VitalsMetric = {
  id: string
  name: string
  value: number
  rating?: "good" | "needs-improvement" | "poor"
}

export function WebVitals() {
  useEffect(() => {
    const report = (metric: VitalsMetric) => {
      const body = JSON.stringify(metric)

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", body)
        return
      }

      fetch("/api/vitals", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => undefined)
    }

    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(report)
      onFCP(report)
      onINP(report)
      onLCP(report)
      onTTFB(report)
    })
  }, [])

  return null
}


