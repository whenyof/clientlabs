"use client"

import { heroContent } from "@/components/landing/content"
import { BrandIcons } from "@/components/landing/brand-icons"

const ORBITS = [
  {
    inset: "24%",
    animation: "orbit-cw 55s linear infinite",
    tools: [
      { idx: 0, angle: 45 },
      { idx: 1, angle: 225 },
    ],
    radius: 46,
  },
  {
    inset: "12%",
    animation: "orbit-ccw 75s linear infinite",
    tools: [
      { idx: 2, angle: 10 },
      { idx: 3, angle: 130 },
      { idx: 4, angle: 250 },
    ],
    radius: 48,
  },
  {
    inset: "0%",
    animation: "orbit-cw 95s linear infinite",
    tools: [
      { idx: 5, angle: 70 },
      { idx: 6, angle: 190 },
      { idx: 7, angle: 310 },
    ],
    radius: 48,
  },
]

export function HeroVisual() {
  const tools = heroContent.tools as readonly { name: string; color: string; style: Record<string, string> }[]

  return (
    <div className="relative aspect-square w-full max-w-[540px] mx-auto">

      {/* Keyframes injected here so they survive Tailwind @layer scoping */}
      <style>{`
        @keyframes orbit-cw   { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes orbit-ccw  { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes hero-float { 0%,100% { transform: translateY(0px);   }  50% { transform: translateY(-7px); } }
        @keyframes glow-pulse { 0%,100% { opacity: 1; transform: scale(1);    } 50% { opacity: 0.65; transform: scale(1.12); } }
      `}</style>

      {/* ── Orbiting rings with tools ── */}
      {ORBITS.map((orbit, oi) => {
        const counterAnimation = orbit.animation.includes("orbit-cw")
          ? orbit.animation.replace("orbit-cw", "orbit-ccw")
          : orbit.animation.replace("orbit-ccw", "orbit-cw")

        return (
          <div
            key={oi}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: orbit.inset,
              animation: orbit.animation,
            }}
          >
            {/* The dashed ring line */}
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50" cy="50" r="49"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.5"
                strokeDasharray="5 8"
              />
            </svg>

            {/* Tools riding on the ring */}
            {orbit.tools.map(({ idx, angle }) => {
              const tool = tools[idx]
              if (!tool) return null
              const brand = BrandIcons[tool.name]

              const rad = (angle * Math.PI) / 180
              const x = 50 + orbit.radius * Math.cos(rad)
              const y = 50 + orbit.radius * Math.sin(rad)

              return (
                <div
                  key={tool.name}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Counter-rotate so the chip text stays horizontal */}
                  <div style={{ animation: counterAnimation }}>
                    <div className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2.5 font-display text-[13px] font-semibold text-ink shadow-[0_8px_24px_rgba(0,0,0,.22),0_1px_0_rgba(255,255,255,.7)_inset] whitespace-nowrap">
                      {brand ? (
                        <span
                          style={{ display: "grid", placeItems: "center", width: 20, height: 20, flexShrink: 0 }}
                          dangerouslySetInnerHTML={{ __html: brand.svg }}
                        />
                      ) : (
                        <span
                          className="grid place-items-center rounded-[6px] font-display text-[12px] font-black text-white"
                          style={{ width: 24, height: 24, background: tool.color, flexShrink: 0 }}
                        >
                          {tool.name[0]}
                        </span>
                      )}
                      {tool.name}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* ── Core: Glassmorphic product card ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 176,
          zIndex: 3,
        }}
      >
        {/* Ambient glow — pulses */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -52,
            background: "radial-gradient(circle, rgba(31,169,122,0.32) 0%, transparent 68%)",
            borderRadius: "50%",
            pointerEvents: "none",
            animation: "glow-pulse 3.6s ease-in-out infinite",
          }}
        />

        {/* The card itself — floats gently */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(160deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 100%)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderTop: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 18,
            padding: "14px 15px 13px",
            boxShadow: "0 28px 64px rgba(0,0,0,0.50), 0 0 0 0.5px rgba(255,255,255,0.05) inset",
            animation: "hero-float 4.8s ease-in-out infinite",
          }}
        >
          {/* Brand mark + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #1FA97A 0%, #14866a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(31,169,122,0.45)",
              flexShrink: 0,
            }}>
              {/* Inline chart/CL mark */}
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="10" width="3" height="5" rx="1" fill="rgba(255,255,255,0.9)"/>
                <rect x="7" y="6.5" width="3" height="8.5" rx="1" fill="rgba(255,255,255,0.9)"/>
                <rect x="12" y="2" width="3" height="13" rx="1" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.022em", lineHeight: 1.2 }}>
                ClientLabs
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 2 }}>
                dashboard
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "0.5px", background: "rgba(255,255,255,0.09)", marginBottom: 11 }} />

          {/* Metric rows */}
          {[
            { label: "Facturación",    value: "€8.4k",  delta: "+18%", up: true  },
            { label: "Leads activos",  value: "12",     delta: "+3",   up: true  },
            { label: "Por cobrar",     value: "€1.2k",  delta: null,   up: false },
          ].map((m) => (
            <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.42)" }}>{m.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontVariantNumeric: "tabular-nums" }}>
                  {m.value}
                </span>
                {m.delta && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: m.up ? "#34d399" : "#f87171",
                    background: m.up ? "rgba(31,169,122,0.18)" : "rgba(248,113,113,0.18)",
                    padding: "1.5px 5px", borderRadius: 4,
                    letterSpacing: "-0.01em",
                  }}>
                    {m.delta}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Mini sparkline */}
          <div style={{ marginTop: 9, background: "rgba(0,0,0,0.22)", borderRadius: 8, padding: "5px 7px" }}>
            <svg width="100%" height="22" viewBox="0 0 142 22" preserveAspectRatio="none">
              <defs>
                <linearGradient id="heroSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1FA97A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1FA97A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,19 L18,16 L36,13 L54,15 L72,9 L90,6 L108,10 L126,5 L142,3 L142,22 L0,22 Z"
                fill="url(#heroSparkGrad)"
              />
              <polyline
                points="0,19 18,16 36,13 54,15 72,9 90,6 108,10 126,5 142,3"
                fill="none"
                stroke="#1FA97A"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="142" cy="3" r="2.5" fill="#1FA97A" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  )
}
