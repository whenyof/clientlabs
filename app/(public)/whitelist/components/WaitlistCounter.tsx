"use client"

import { useState, useEffect } from "react"

export function WaitlistCounter() {
  const [count, setCount] = useState<number | null>(null)

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/waitlist")
      const data = await res.json()
      setCount(data.count)
    } catch {}
  }

  useEffect(() => {
    fetchCount()

    const handler = () => fetchCount()
    window.addEventListener("waitlist-joined", handler)
    return () => window.removeEventListener("waitlist-joined", handler)
  }, [])

  if (count === null) return null

  return (
    <div className="hero-counter inline-flex items-center gap-3 bg-white/8 border border-white/15 rounded-full px-5 py-2.5 mt-8">
      <div className="w-2.5 h-2.5 rounded-full bg-[#1FA97A] animate-pulse flex-shrink-0" />
      <span className="text-[14px] text-white/70">
        <span className="text-white font-bold text-[16px] mr-1 tabular-nums">
          {count}
        </span>
        profesionales ya esperando
      </span>
    </div>
  )
}
