import Link from "next/link"

import { heroContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { GridBackground, NoiseOverlay } from "@/components/landing/utils"
import { HeroVisual } from "@/components/landing/hero-visual"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Background layers */}
      <GridBackground variant="dark" />
      {/* Glow top-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[220px] -top-[220px] h-[900px] w-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(31,169,122,.18), transparent 60%)",
        }}
      />
      {/* Glow bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[240px] -right-[180px] h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(31,169,122,.10), transparent 60%)",
        }}
      />
      <NoiseOverlay opacity={0.04} className="mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-7 pb-32 pt-44">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          {/* ── Left column ── */}
          <div>
            {/* Pill */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-dark-2 bg-white/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-[#d9e1e5]">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
              </span>
              {heroContent.pill}
            </span>

            {/* h1 */}
            <h1
              className="font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-[clamp(48px,6.2vw,86px)] mt-5 mb-5"
            >
              {heroContent.headline}
              <br />
              Un solo{" "}
              <span className="text-emerald after:block after:h-[3px] after:-mt-1 after:w-[60%] after:rounded-[2px] after:bg-gradient-to-r after:from-emerald after:to-transparent">
                {heroContent.headlineAccent.replace("Un solo ", "")}
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg leading-[1.55] text-[#c6d0d6] max-w-[560px]">
              {heroContent.sub}
            </p>

            {/* CTAs */}
            <div className="mt-8 mb-6 flex flex-wrap gap-3">
              <Link
                href={heroContent.ctas.primary.href}
                className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-4 font-display text-base font-semibold tracking-[-0.01em] text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_20px_rgba(31,169,122,.28)] transition-all hover:-translate-y-px hover:bg-emerald-2"
              >
                {heroContent.ctas.primary.label}
                <LandingIcons.arrow className="h-4 w-4" />
              </Link>
              <Link
                href={heroContent.ctas.secondary.href}
                className="inline-flex items-center gap-2 rounded-full border border-line-dark-2 bg-transparent px-6 py-4 font-display text-base font-semibold text-[#e7edf0] transition-all hover:border-white hover:bg-white/[0.04]"
              >
                <LandingIcons.play className="h-4 w-4" />
                {heroContent.ctas.secondary.label}
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3.5">
              <div className="flex">
                {heroContent.proof.avatars.map((av) => (
                  <span
                    key={av.initials}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-navy font-display text-[12px] font-bold text-white first:ml-0 -ml-2"
                    style={{ background: av.color }}
                  >
                    {av.initials}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#c6d0d6]">
                <strong className="font-semibold text-white">
                  {heroContent.proof.count}
                </strong>{" "}
                {heroContent.proof.label}
              </p>
            </div>

            {/* Trust row */}
            <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-[13px] text-[#8fa0aa]">
              {heroContent.trust.map((item, i) => (
                <span key={item} className="flex items-center gap-3.5">
                  {item}
                  {i < heroContent.trust.length - 1 && (
                    <span className="opacity-50">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right column — chaos visual ── */}
          <div className="flex justify-center lg:justify-start">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
