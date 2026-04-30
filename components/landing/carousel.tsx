"use client"

import { useRef, useEffect, useCallback } from "react"
import Link from "next/link"

import { carouselContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

const TONE_BG: Record<string, string> = {
  "tone-navy":    "#0B1F2A",
  "tone-emerald": "linear-gradient(135deg, #1FA97A, #0f7a56)",
  "tone-neutral": "#1b2d36",
}

export function Carousel() {
  const {
    eyebrow, headline, headlineAccent,
    progress, progressHint,
    slides, ctaCard,
  } = carouselContent

  const totalCards = slides.length + 1   // 4 slides + 1 CTA

  /* ── Desktop refs ─────────────────────────────────────────────────────── */
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)
  const fillRef    = useRef<HTMLDivElement>(null)

  /* ── Desktop: pure-JS scroll pinned ──────────────────────────────────────
     globals.css has overflow-x:hidden on html+body. Per CSS spec, when
     overflow-x is non-visible, overflow-y is computed as "auto" — so BODY
     becomes the scroll container, not window. As a result:
       • window.scrollY is always 0
       • window scroll events never fire

     Fix: listen on `document` (catches scroll from ANY scroll container)
     and read scroll position from body.scrollTop / documentElement.scrollTop.

     getBoundingClientRect() always returns position relative to the browser
     viewport, regardless of scroll container — so -rect.top = scrolled. */
  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    const fill    = fillRef.current
    if (!section || !track || !fill) return

    let raf = 0

    const tick = () => {
      const rect        = section.getBoundingClientRect()
      const totalScroll = section.offsetHeight - window.innerHeight
      const scrolled    = -rect.top                                    // viewport-relative, always correct
      const prog        = Math.max(0, Math.min(1, scrolled / totalScroll))
      const maxX        = track.scrollWidth - window.innerWidth + 80
      const tx          = -prog * maxX

      track.style.transform = `translateX(${tx}px)`
      fill.style.width      = `${prog * 100}%`
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    // document catches scroll bubbling from ANY scroll container
    // (window, body, html — regardless of overflow-x:hidden on body)
    document.addEventListener("scroll", onScroll, { passive: true })

    tick() // seed initial position

    return () => {
      document.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* ── Mobile refs ──────────────────────────────────────────────────────── */
  const mobTrackRef = useRef<HTMLDivElement>(null)
  const mobFillRef  = useRef<HTMLDivElement>(null)

  const handleMobScroll = useCallback(() => {
    const t = mobTrackRef.current
    const f = mobFillRef.current
    if (!t || !f) return
    const pct = t.scrollWidth > t.clientWidth
      ? (t.scrollLeft / (t.scrollWidth - t.clientWidth)) * 100
      : 0
    f.style.width = pct.toFixed(1) + "%"
  }, [])

  return (
    <div id="Novedades">

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE (< lg) — native horizontal snap-scroll
          ══════════════════════════════════════════════════════════════ */}
      <section className="lg:hidden bg-[#F8FAFB] pt-[80px] pb-[60px]">
        <div className="mx-auto max-w-[1240px] px-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            {eyebrow}
          </span>
          <h2 className="mt-[14px] font-display text-[clamp(36px,4.4vw,60px)] font-extrabold leading-[1.02] tracking-[-0.035em] max-w-[900px]">
            {headline}<br />
            <span className="text-emerald">{headlineAccent}</span>
          </h2>
        </div>

        <div className="mx-auto max-w-[1240px] px-7 mt-6 flex items-center gap-3 font-mono text-[11px] text-ink-3 tracking-[0.06em]">
          <span>{progress}</span>
          <div className="relative flex-1 h-[3px] rounded-full bg-[#dde3e6] overflow-hidden">
            <div ref={mobFillRef} className="absolute inset-0 w-0 rounded-full bg-navy" style={{ transition: "none" }} />
          </div>
          <span>{progressHint}</span>
        </div>

        <div
          ref={mobTrackRef}
          onScroll={handleMobScroll}
          className="mt-8 flex gap-5 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingLeft: "5vw", paddingRight: "5vw", paddingBottom: 24 }}
        >
          {slides.map((slide) => {
            const isEmerald   = slide.tone === "tone-emerald"
            const impactClass = isEmerald ? "bg-black/[0.14] border-black/[0.14]" : "bg-white/[0.14] border-white/[0.18]"
            return (
              <div
                key={slide.num}
                className="shrink-0 text-white flex flex-col justify-between overflow-hidden relative"
                style={{ scrollSnapAlign: "center", background: TONE_BG[slide.tone], width: "85vw", aspectRatio: "5 / 3.2", borderRadius: 24, padding: "28px" }}
              >
                <div className="z-[1] flex flex-col gap-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                    Paso {slide.num}
                  </div>
                  <div className="font-display font-extrabold text-[clamp(20px,4vw,28px)] leading-[1.1] tracking-[-0.03em]">
                    {slide.who}
                  </div>
                  <p className="text-[13px] leading-[1.5] opacity-75">
                    {slide.quote}
                  </p>
                </div>
                <div className="flex justify-end items-end z-[1]">
                  <div className={`font-mono text-[12px] px-3 py-2 rounded-full border ${impactClass}`}>
                    <b className="font-display font-extrabold text-[14px] mr-1">{slide.impact[0]}</b>
                    {slide.impact[1]}
                  </div>
                </div>
              </div>
            )
          })}
          <div
            className="shrink-0 text-white flex flex-col justify-center gap-5 overflow-hidden relative"
            style={{ scrollSnapAlign: "center", background: "linear-gradient(135deg, #0B1F2A, #133f32)", width: "85vw", aspectRatio: "5 / 3.2", borderRadius: 24, padding: "28px" }}
          >
            <div className="z-[1]">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">{ctaCard.eyebrow}</span>
              <h3 className="font-display font-extrabold leading-[1] tracking-[-0.04em] mt-2 text-[clamp(28px,6vw,40px)]">{ctaCard.headline}</h3>
            </div>
            <Link href={ctaCard.cta.href} className="inline-flex items-center gap-2 bg-emerald text-white font-display font-semibold text-[14px] px-4 py-2.5 rounded-full self-start">
              {ctaCard.cta.label}<LandingIcons.arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP (≥ lg) — scroll-pinned horizontal carousel

          Structure mirrors the reference exactly:
            pin-root  → section (position:relative, height:totalCards×100vh)
            pin-inner → sticky div (overflow:hidden, flex-col, justify-center)
            track     → DIRECT flex child of pin-inner (no intermediate wrapper)

          The track has NO CSS transform classes — only the JS inline style
          is applied, avoiding any conflict with Tailwind's transform system.
          ══════════════════════════════════════════════════════════════ */}
      <section
        ref={sectionRef}
        className="hidden lg:block relative bg-[#F8FAFB]"
        style={{ height: `${totalCards * 100}vh` }}
      >
        {/* pin-inner */}
        <div
          className="sticky top-0 h-screen flex flex-col justify-center"
          style={{ overflow: "hidden" }}
        >

          {/* Header + progress */}
          <div className="mx-auto w-full max-w-[1240px] px-7 pt-16">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {eyebrow}
            </span>
            <h2 className="mt-[14px] font-display text-[clamp(36px,4.4vw,60px)] font-extrabold leading-[1.02] tracking-[-0.035em] max-w-[900px]">
              {headline}<br />
              <span className="text-emerald">{headlineAccent}</span>
            </h2>

            <div className="mt-6 flex items-center gap-3 font-mono text-[11px] text-ink-3 tracking-[0.06em]">
              <span>{progress}</span>
              <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[#dde3e6]">
                <div
                  ref={fillRef}
                  className="absolute inset-y-0 left-0 rounded-full bg-navy"
                  style={{ width: "0%", transition: "none" }}
                />
              </div>
              <span>{progressHint}</span>
            </div>
          </div>

          {/* track — DIRECT child, no wrapper, no CSS transform classes */}
          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: "28px",
              paddingLeft: "10vw",
              paddingRight: "10vw",
              marginTop: "32px",
              willChange: "transform",
              flexShrink: 0,
            }}
          >
            {slides.map((slide) => {
              const isEmerald   = slide.tone === "tone-emerald"
              const impactClass = isEmerald
                ? "bg-black/[0.14] border-black/[0.14]"
                : "bg-white/[0.14] border-white/[0.18]"
              return (
                <div
                  key={slide.num}
                  className="text-white flex flex-col justify-between overflow-hidden relative"
                  style={{ flexShrink: 0, background: TONE_BG[slide.tone], width: "62vw", maxWidth: 820, aspectRatio: "5 / 3.2", borderRadius: 24, padding: "42px 44px" }}
                >
                  <div
                    className="font-display font-black leading-[1] tracking-[-0.06em] opacity-[0.18] absolute top-6 right-9 pointer-events-none select-none"
                    style={{ fontSize: 140 }}
                    aria-hidden="true"
                  >
                    {slide.num}
                  </div>
                  <div className="z-[1] flex flex-col gap-4">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
                      Paso {slide.num}
                    </div>
                    <div className="font-display font-extrabold text-[clamp(28px,2.8vw,42px)] leading-[1.05] tracking-[-0.03em] max-w-[560px]">
                      {slide.who}
                    </div>
                    <p className="text-[16px] leading-[1.55] opacity-75 max-w-[500px]">
                      {slide.quote}
                    </p>
                  </div>
                  <div className="flex justify-end items-end z-[1]">
                    <div className={`font-mono text-[13px] px-[14px] py-[10px] rounded-full border ${impactClass}`}>
                      <b className="font-display font-extrabold text-[16px] mr-1.5">{slide.impact[0]}</b>
                      {slide.impact[1]}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* CTA card */}
            <div
              className="text-white flex flex-col justify-center gap-7 overflow-hidden relative"
              style={{ flexShrink: 0, background: "linear-gradient(135deg, #0B1F2A, #133f32)", width: "62vw", maxWidth: 820, aspectRatio: "5 / 3.2", borderRadius: 24, padding: "42px 44px" }}
            >
              <div
                className="font-display font-black leading-[1] tracking-[-0.06em] opacity-[0.18] absolute top-6 right-9 pointer-events-none select-none"
                style={{ fontSize: 140 }}
                aria-hidden="true"
              >
                {ctaCard.num}
              </div>
              <div className="z-[1]">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">{ctaCard.eyebrow}</span>
                <h3
                  className="font-display font-extrabold leading-[1] tracking-[-0.04em] mt-3 whitespace-pre-line"
                  style={{ fontSize: "clamp(40px, 4vw, 66px)" }}
                >
                  {ctaCard.headline}
                </h3>
              </div>
              <div className="z-[1] flex items-center gap-3 flex-wrap">
                <Link
                  href={ctaCard.cta.href}
                  className="inline-flex items-center gap-2 bg-emerald hover:opacity-90 text-white font-display font-semibold text-[15px] px-5 py-3 rounded-full transition-opacity"
                >
                  {ctaCard.cta.label}
                  <LandingIcons.arrow className="h-4 w-4" />
                </Link>
                <span className="text-[14px] opacity-80">{ctaCard.hint}</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
