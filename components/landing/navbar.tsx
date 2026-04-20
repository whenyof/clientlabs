"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { navbarContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () =>
      setScrolled(document.body.scrollTop > 40 || window.scrollY > 40)
    onScroll()
    document.body.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      document.body.removeEventListener("scroll", onScroll)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-[padding] duration-300",
        scrolled ? "py-3" : "py-[18px]",
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center gap-4 rounded-full border px-4 py-3 transition-all duration-300",
          scrolled
            ? "max-w-[1040px] border-line bg-white/[0.78] text-ink shadow-nav [backdrop-filter:saturate(140%)_blur(14px)]"
            : "max-w-[1240px] border-transparent bg-transparent text-white",
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-[18px] font-extrabold tracking-[-0.02em]"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald font-display text-[15px] font-black text-white shadow-[0_6px_14px_rgba(31,169,122,.3)]">
            C
          </span>
          <span>{navbarContent.brand}</span>
        </Link>

        {/* Nav links — hidden below lg */}
        <nav
          aria-label="Principal"
          className="ml-2 hidden flex-1 items-center gap-1 lg:flex"
        >
          {navbarContent.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium opacity-[0.85] transition-all duration-200 hover:opacity-100",
                scrolled ? "hover:bg-black/[0.06]" : "hover:bg-white/[0.08]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={navbarContent.ctas.login.href}
            className="px-3 py-2 text-sm font-medium opacity-[0.85] transition-opacity hover:opacity-100"
          >
            {navbarContent.ctas.login.label}
          </Link>
          <Link
            href={navbarContent.ctas.primary.href}
            className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2.5 font-display text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_20px_rgba(31,169,122,.28)] transition-all duration-[180ms] hover:-translate-y-px hover:bg-emerald-2"
          >
            {navbarContent.ctas.primary.label}
            <LandingIcons.arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
