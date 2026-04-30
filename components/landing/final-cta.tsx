import Link from "next/link"

import { finalCtaContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { GridBackground, NoiseOverlay } from "@/components/landing/utils"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-navy py-40 text-white">
      {/* Background layers */}
      <GridBackground variant="dark" />
      {/* Central glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[10%] h-[700px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(31,169,122,.18), transparent 60%)",
        }}
      />
      <NoiseOverlay opacity={0.04} className="mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[860px] px-7 text-center">
        {/* Headline */}
        <h2
          className="my-4 font-display font-extrabold leading-[0.98] tracking-[-0.045em] text-[clamp(54px,7vw,104px)]"
        >
          {finalCtaContent.headline}
          <br />
          <em className="not-italic text-emerald">
            {finalCtaContent.headlineAccent}
          </em>
        </h2>

        {/* Sub */}
        <p className="mx-auto mb-8 max-w-[540px] text-lg leading-[1.55] text-[#c6d0d6]">
          {finalCtaContent.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={finalCtaContent.ctas.primary.href}
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-4 font-display text-base font-semibold tracking-[-0.01em] text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_20px_rgba(31,169,122,.28)] transition-all hover:-translate-y-px hover:bg-emerald-2"
          >
            {finalCtaContent.ctas.primary.label}
            <LandingIcons.arrow className="h-4 w-4" />
          </Link>
          <Link
            href={finalCtaContent.ctas.secondary.href}
            className="inline-flex items-center gap-2 rounded-full border border-line-dark-2 bg-transparent px-6 py-4 font-display text-base font-semibold text-[#e7edf0] transition-all hover:border-white hover:bg-white/[0.04]"
          >
            <LandingIcons.play className="h-4 w-4" />
            {finalCtaContent.ctas.secondary.label}
          </Link>
        </div>

        {/* Trust row */}
        <div className="mt-9 flex flex-wrap justify-center gap-[22px] text-[13.5px] text-[#8fa0aa]">
          {finalCtaContent.trust.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <LandingIcons.check className="h-3.5 w-3.5 text-emerald" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
