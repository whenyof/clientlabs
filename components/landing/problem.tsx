import Link from "next/link"

import { problemContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { TangleVisual } from "@/components/landing/previews/tangle-visual"

export function Problem() {
  const { eyebrow, headline, headlineAccent, sub, pains, resolve } = problemContent

  return (
    <section id="Producto" className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="grid grid-cols-1 items-start gap-[80px] lg:grid-cols-[1.05fr_1.2fr]">

          {/* ── Left: sticky tangle visual ── */}
          <TangleVisual />

          {/* ── Right: content ── */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {eyebrow}
            </span>
            <h2 className="mt-4 mb-4 font-display text-[clamp(40px,4.4vw,60px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              {headline}
              <br />
              {headlineAccent}
            </h2>
            <p className="mb-10 max-w-[540px] text-[17px] leading-[1.55] text-ink-2">{sub}</p>

            {/* Pain grid: 2 cols */}
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              {pains.map((pain) => (
                <div
                  key={pain.num}
                  className="rounded-card border border-line bg-white p-[22px] pb-[26px] transition-all duration-200 hover:-translate-y-[3px] hover:border-transparent hover:shadow-pop"
                >
                  <div className="font-mono text-[12px] font-medium tracking-[0.08em] text-emerald-ink">
                    — {pain.num}
                  </div>
                  <div className="mt-2.5 mb-2 font-display text-[19px] font-bold tracking-[-0.02em]">
                    {pain.title}
                  </div>
                  <div className="text-[14px] leading-[1.5] text-ink-2">{pain.desc}</div>
                </div>
              ))}
            </div>

            {/* Resolve card */}
            <div
              className="relative mt-10 flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-card-lg border border-[rgba(31,169,122,.22)] p-[28px_32px] text-white"
              style={{ background: "linear-gradient(135deg, #133f32, #0B1F2A)" }}
            >
              {/* Left accent bar */}
              <span className="absolute bottom-0 left-0 top-0 w-1 bg-emerald" aria-hidden="true" />

              {/* Check icon */}
              <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-emerald/[0.22] text-emerald">
                <LandingIcons.check className="h-5 w-5" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="m-0 mb-1.5 font-display text-[22px] font-bold tracking-[-0.02em]">
                  {resolve.title}
                </h3>
                <p className="m-0 text-[14.5px] text-[#b6c2c9]">{resolve.sub}</p>
              </div>

              {/* CTA */}
              <Link
                href={resolve.cta.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald px-5 py-3 font-display text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_20px_rgba(31,169,122,.28)] transition-all hover:-translate-y-px hover:bg-emerald-2"
              >
                {resolve.cta.label}
                <LandingIcons.arrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
