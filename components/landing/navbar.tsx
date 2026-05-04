"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, User, Settings, LogOut, ChevronDown, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { navbarContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"

function ProfileDropdown({ name, email, image }: { name?: string | null; email?: string | null; image?: string | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email?.[0]?.toUpperCase() ?? "U"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-black/[0.06] data-[scrolled=false]:hover:bg-white/[0.1]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {image ? (
          <Image src={image} alt={name ?? "Perfil"} width={28} height={28} className="rounded-full object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-emerald flex items-center justify-center text-[11px] font-bold text-white" style={{ background: "#1FA97A" }}>
            {initials}
          </div>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#e5e7eb] bg-white py-1.5 shadow-lg shadow-black/10 z-50">
          {/* User info */}
          <div className="px-3.5 py-2.5 border-b border-[#f3f4f6]">
            <p className="text-[13px] font-semibold text-[#111] truncate">{name ?? "Mi cuenta"}</p>
            {email && <p className="text-[11px] text-[#888] truncate mt-0.5">{email}</p>}
          </div>

          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
            >
              <User className="h-3.5 w-3.5 text-[#9ca3af]" />
              Mi perfil
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] hover:bg-[#f9fafb] transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-[#9ca3af]" />
              Ajustes
            </Link>
          </div>

          <div className="border-t border-[#f3f4f6] py-1">
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }) }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated" && !!session

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
        scrolled ? "py-[14px]" : "py-[18px]",
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex items-center rounded-full border px-[18px] py-3 transition-all duration-300",
          scrolled
            ? "max-w-[1040px] border-line bg-white/[0.78] text-ink shadow-nav [backdrop-filter:saturate(140%)_blur(14px)]"
            : "max-w-[1240px] border-transparent bg-transparent text-white",
        )}
      >
        {/* Logo — left */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1 font-display text-[18px] font-extrabold tracking-[-0.02em]"
        >
          <Image src="/logo-trimmed.webp" alt="ClientLabs" width={28} height={28} className="object-contain" />
          <span>{navbarContent.brand}</span>
        </Link>

        {/* Nav links — absolutely centred in the pill (desktop only) */}
        <nav
          aria-label="Principal"
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
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

        {/* CTAs — right (desktop) */}
        <div className="ml-auto hidden lg:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-[180ms]",
                  scrolled
                    ? "text-[#374151] hover:bg-black/[0.06]"
                    : "text-white/90 hover:bg-white/[0.1]",
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <ProfileDropdown
                name={session.user?.name}
                email={session.user?.email}
                image={session.user?.image}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={cn(
            "ml-auto lg:hidden h-9 w-9 flex items-center justify-center rounded-full transition-colors",
            scrolled ? "hover:bg-black/[0.06]" : "hover:bg-white/[0.1]"
          )}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "lg:hidden mx-4 mt-2 rounded-2xl border shadow-lg py-3 overflow-hidden",
            scrolled
              ? "bg-white/[0.95] border-[#e5e7eb] text-[#374151] [backdrop-filter:saturate(140%)_blur(14px)]"
              : "bg-[#0B1F2A]/[0.95] border-white/10 text-white [backdrop-filter:blur(20px)]"
          )}
        >
          {/* Nav links */}
          <div className="px-2 pb-2 border-b border-current/10">
            {navbarContent.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                  scrolled ? "hover:bg-black/[0.06]" : "hover:bg-white/[0.08]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="px-4 pt-3 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-[#1FA97A] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Ir al Dashboard
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }) }}
                  className={cn(
                    "flex items-center justify-center gap-2 min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium border",
                    scrolled ? "border-[#e5e7eb] text-red-500" : "border-white/20 text-red-300"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href={navbarContent.ctas.primary.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-[#1FA97A] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {navbarContent.ctas.primary.label}
                </Link>
                <Link
                  href={navbarContent.ctas.login.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-center min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium border",
                    scrolled ? "border-[#e5e7eb] text-[#374151]" : "border-white/20 text-white/90"
                  )}
                >
                  {navbarContent.ctas.login.label}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
