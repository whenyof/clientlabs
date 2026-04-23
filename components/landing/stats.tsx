"use client"

import { useRef, useState, useEffect } from "react"

import { statsContent } from "@/components/landing/content"

/* ─── CountUp ──────────────────────────────────────────────────────────── */

function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const [val, setVal] = useState(0)
  const ref     = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const p     = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - p, 3)
              setVal(to * eased)
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  )
}

/* ─── MiniChart ────────────────────────────────────────────────────────── */

function MiniChart() {
  const { months, before, after, max } = statsContent.chart

  return (
    <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 16, padding: "0 6px" }}>
      {months.map((month, i) => (
        <div
          key={month}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 150, width: "100%", justifyContent: "center" }}>
            <div
              style={{
                width: "38%",
                height: `${((before[i] as number) / max) * 100}%`,
                background: "#d7dee2",
                borderRadius: "4px 4px 0 0",
              }}
            />
            <div
              style={{
                width: "38%",
                height: `${((after[i] as number) / max) * 100}%`,
                background: "linear-gradient(to top, #1FA97A, #17c088)",
                borderRadius: "4px 4px 0 0",
              }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-3">{month}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Stats ────────────────────────────────────────────────────────────── */

export function Stats() {
  const { eyebrow, headline, sub, stats, chart } = statsContent

  return (
    <section className="bg-[#F8FAFB] py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">

        {/* Header — mirrors ref: textAlign center, maxWidth 760, margin auto */}
        <div className="mx-auto max-w-[760px] text-center mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {eyebrow}
          </span>
          <h2
            className="mt-4 mb-4 font-display font-extrabold leading-[1] tracking-[-0.04em]"
            style={{ fontSize: "clamp(42px,5vw,72px)" }}
          >
            {headline}
          </h2>
          <p className="text-[17px] leading-[1.55] text-ink-2">{sub}</p>
        </div>

        {/* Stats grid — ref: repeat(4,1fr) gap-5 mt-10 */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((s) => {
            /*
             * accent = prefix is non-empty ("−" or "+")
             * ref: .stat .v.accent { color: var(--emerald-ink) }
             */
            const isAccent = s.prefix.length > 0
            /*
             * unit = suffix is multi-char ("h/día")
             * ref: .stat .v .unit { font-size: 22px; color: var(--emerald) }
             */
            const isUnit = s.suffix.length > 1

            return (
              <div
                key={s.label}
                style={{ borderRadius: 22 }}
                className="border border-line bg-white p-[36px_28px] text-left"
              >
                {/* Value — ref: .stat .v */}
                <div
                  className={[
                    "font-display font-black tracking-[-0.04em] text-[64px] leading-[1]",
                    isAccent ? "text-emerald-ink" : "text-navy",
                  ].join(" ")}
                >
                  <CountUp
                    to={s.value}
                    prefix={s.prefix}
                    suffix={isUnit ? "" : s.suffix}
                    decimals={s.decimals}
                  />
                  {/* ref: .stat .v .unit */}
                  {isUnit && (
                    <span className="font-display text-[22px] font-bold ml-1 text-emerald tracking-[-0.02em]">
                      {s.suffix}
                    </span>
                  )}
                </div>

                {/* Label — ref: .stat .l */}
                <div className="mt-3 text-[14px] leading-[1.45] text-ink-2">{s.label}</div>
              </div>
            )
          })}

          {/* Chart — ref: .stat-chart { grid-column: span 4; padding: 28px; margin-top: 12px } */}
          <div
            className="col-span-2 lg:col-span-4 mt-3 border border-line bg-white p-7"
            style={{ borderRadius: 22 }}
          >
            {/* Chart header */}
            <div className="flex justify-between items-end mb-5 flex-wrap gap-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
                  {chart.eyebrow}
                </div>
                <div className="font-display font-bold text-[28px] tracking-[-0.02em] mt-2">
                  {chart.headline}
                </div>
              </div>
              <div className="flex gap-[18px] text-[13px] text-ink-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[#d7dee2]" />
                  {chart.legendBefore}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[#1FA97A]" />
                  {chart.legendAfter}
                </span>
              </div>
            </div>

            <MiniChart />
          </div>
        </div>
      </div>
    </section>
  )
}
