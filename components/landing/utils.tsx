/**
 * Shared primitives for the landing page.
 * All are Server Components unless they need interactivity ("use client").
 * Import cn() from @/lib/utils (shadcn) for class merging.
 */

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/* ─── SectionWrapper ─────────────────────────────────────────────── */

type SectionVariant = "light" | "dark" | "surface"

interface SectionWrapperProps {
  id?: string
  variant?: SectionVariant
  className?: string
  children: ReactNode
}

const variantClasses: Record<SectionVariant, string> = {
  light:   "bg-white text-ink",
  dark:    "bg-navy text-white",
  surface: "bg-[#F8FAFB] text-ink",
}

export function SectionWrapper({
  id,
  variant = "light",
  className,
  children,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative min-h-screen flex items-center overflow-x-hidden",
        variantClasses[variant],
        className,
      )}
    >
      <div className="max-w-[1180px] mx-auto px-6 md:px-8 w-full py-24 relative z-10">
        {children}
      </div>
    </section>
  )
}

/* ─── EyebrowLabel ───────────────────────────────────────────────── */

interface EyebrowLabelProps {
  children: ReactNode
  color?: string           // e.g. "text-emerald" or any Tailwind text-* class
  className?: string
}

export function EyebrowLabel({
  children,
  color = "text-emerald",
  className,
}: EyebrowLabelProps) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.15em] mb-4",
        color,
        className,
      )}
    >
      {children}
    </p>
  )
}

/* ─── DisplayHeading ─────────────────────────────────────────────── */

type HeadingLevel = "h1" | "h2" | "h3"

interface DisplayHeadingProps {
  as?: HeadingLevel
  children: ReactNode
  className?: string
  /**
   * Tight tracking + display font applied automatically.
   * Pass size classes via className if you need to override.
   */
}

export function DisplayHeading({
  as: Tag = "h2",
  children,
  className,
}: DisplayHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-display font-bold leading-[1.06] tracking-[-0.025em]",
        "text-[42px] md:text-[52px]",
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/* ─── GridBackground ─────────────────────────────────────────────── */

interface GridBackgroundProps {
  variant?: "light" | "dark"
  className?: string
}

export function GridBackground({
  variant = "light",
  className,
}: GridBackgroundProps) {
  const isDark = variant === "dark"
  const color = isDark ? "rgba(255,255,255,.04)" : "rgba(11,31,42,.035)"
  const size  = isDark ? "56px 56px" : "48px 48px"

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: size,
      }}
    />
  )
}

/* ─── NoiseOverlay ───────────────────────────────────────────────── */

interface NoiseOverlayProps {
  opacity?: number  // 0–1, default 0.03
  className?: string
}

export function NoiseOverlay({ opacity = 0.03, className }: NoiseOverlayProps) {
  // SVG fractal noise as a data URI — no external request
  const svgNoise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ backgroundImage: svgNoise, opacity }}
    />
  )
}

/* ─── Pill ───────────────────────────────────────────────────────── */

interface PillProps {
  children: ReactNode
  dotColor?: string   // CSS color value, e.g. "#1FA97A"
  className?: string
}

export function Pill({ children, dotColor = "#1FA97A", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        "rounded-full border border-emerald/20 bg-emerald/10",
        "text-emerald text-[11px] px-3 py-1.5",
        className,
      )}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: dotColor }}
        />
        <span
          className="relative inline-flex rounded-full h-1.5 w-1.5"
          style={{ background: dotColor }}
        />
      </span>
      {children}
    </span>
  )
}

/* ─── DecoNumber ─────────────────────────────────────────────────── */
/**
 * The large decorative section number (01, 02, …) shown in the background.
 */

interface DecoNumberProps {
  children: string  // e.g. "01"
  side?: "left" | "right"
  variant?: "light" | "dark"
  className?: string
}

export function DecoNumber({
  children,
  side = "right",
  variant = "light",
  className,
}: DecoNumberProps) {
  const color = variant === "dark" ? "rgba(255,255,255,0.025)" : "#F3F4F6"
  const transform =
    side === "right"
      ? "translateY(-50%) translateX(30%)"
      : "translateY(-50%) translateX(-30%)"
  const pos = side === "right" ? { right: 0 } : { left: 0 }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute select-none hidden lg:block",
        "text-[220px] font-black leading-none",
        className,
      )}
      style={{ color, top: "50%", transform, ...pos }}
    >
      {children}
    </span>
  )
}
