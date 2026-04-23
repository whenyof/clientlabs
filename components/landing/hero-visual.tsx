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
        @keyframes orbit-cw  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
        @keyframes orbit-ccw { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }
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

      {/* ── Core: Logo (the sun) ── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 200,
          height: 200,
          zIndex: 3,
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: -40,
            background: "radial-gradient(circle, rgba(31,169,122,0.30) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <img
          src="/logo-trimmed.png"
          alt="ClientLabs"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>

    </div>
  )
}
