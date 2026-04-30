import Link from "next/link"

import { heroContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { GridBackground, NoiseOverlay } from "@/components/landing/utils"
import { HeroBackground } from "@/components/landing/hero-background"

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-navy text-white flex flex-col justify-center">

      {/* Grid background */}
      <GridBackground variant="dark" />

      {/* Animated green lights — client component so keyframes load correctly */}
      <HeroBackground />

      <NoiseOverlay opacity={0.04} className="mix-blend-overlay" />

      {/* Content — centrado verticalmente, offset para el navbar */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-7 pt-28 pb-20">
        <div className="flex flex-col items-center text-center">

          {/* h1 */}
          <h1 className="font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-[clamp(52px,7vw,96px)] mb-6 max-w-[820px]">
            {heroContent.headline}
            <br />
            Un solo{" "}
            <span
              className="text-emerald"
              style={{
                backgroundImage: "linear-gradient(90deg, #1FA97A 70%, transparent 100%)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0 100%",
                backgroundSize: "100% 3px",
                paddingBottom: "4px",
              }}
            >
              sistema
            </span>
            .
          </h1>

          {/* Sub */}
          <p className="text-lg leading-[1.6] text-[#c6d0d6] max-w-[580px] mb-9">
            {heroContent.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link
              href={heroContent.ctas.primary.href}
              className="inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-4 font-display text-base font-semibold tracking-[-0.01em] text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_20px_rgba(31,169,122,.28)] transition-all hover:-translate-y-px hover:bg-emerald-2"
            >
              {heroContent.ctas.primary.label}
              <LandingIcons.arrow className="h-4 w-4" />
            </Link>
            <Link
              href="/producto"
              className="inline-flex items-center gap-2 rounded-full border border-line-dark-2 bg-transparent px-7 py-4 font-display text-base font-semibold text-[#e7edf0] transition-all hover:border-white hover:bg-white/[0.04]"
            >
              Ver el producto
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center items-center gap-3.5 text-[13px] text-[#8fa0aa]">
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
      </div>
    </section>
  )
}
