"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PrimaryButton } from "./buttons"

// BackgroundGlow - Efectos de fondo premium
export function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_68%,rgba(255,255,255,0.04)_90%)] opacity-30" />
    </>
  )
}

// LogoMark - Componente de logo optimizado
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"
  return (
    <div className={`relative ${dimension} flex-shrink-0`}>
      <Image
        src="/logo.PNG"
        alt="ClientLabs"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 48px, 40px"
        loading="lazy"
        style={{ willChange: "transform" }}
      />
    </div>
  )
}

// Navbar - Navegación principal con menú mobile premium
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = [
    { label: "Producto", href: "/producto" },
    { label: "Precios", href: "/precios" },
    { label: "Soluciones", href: "/soluciones" },
    { label: "Recursos", href: "/recursos" },
    { label: "Contacto", href: "/contacto" },
  ]

  // Cerrar menú al tocar fuera o hacer scroll - OPTIMIZADO: throttle scroll listener
  useEffect(() => {
    if (!isMenuOpen) return

    let ticking = false
    let rafId: number | null = null

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("nav") && !target.closest('[aria-label="Menu"]')) {
        setIsMenuOpen(false)
      }
    }

    // Throttled scroll handler usando requestAnimationFrame
    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          setIsMenuOpen(false)
          ticking = false
        })
        ticking = true
      }
    }

    document.addEventListener("click", handleClickOutside, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("click", handleClickOutside)
      window.removeEventListener("scroll", handleScroll)
      document.body.style.overflow = ""
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isMenuOpen])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 relative">
        {/* IZQUIERDA - Logo + ClientLabs */}
        <a href="/" className="flex items-center gap-2.5 text-white group flex-shrink-0 z-50">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <LogoMark size="md" />
          </div>
          <span className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Client<span className="text-purple-500">Labs</span>
          </span>
        </a>

        {/* CENTRO - Navigation Links (TABLET+) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-6 text-sm text-white/70 md:flex lg:gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition-all duration-200 hover:text-white hover:bg-white/5 hover:scale-105"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* DERECHA - Login + CTA (TABLET+) / Menú (MOBILE) */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <PrimaryButton href="/contacto" size="sm" className="hidden md:inline-flex">
            Empezar prueba gratis
          </PrimaryButton>
          
          {/* Botón menú mobile */}
          <button
            aria-label="Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          >
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"}`} />
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {/* Drawer Mobile Premium */}
      <div
        className={`fixed inset-0 top-[var(--nav-height,64px)] z-40 md:hidden ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop blur */}
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-[340px] bg-[#0b0f1c]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col h-full px-6 pt-8 pb-24 space-y-3">
            {navItems.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-4 px-4 text-lg font-semibold text-white/90 rounded-2xl transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA fijo abajo */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-2xl px-6 py-5 space-y-3">
            <PrimaryButton href="/contacto" className="w-full">
              Empezar prueba gratis
            </PrimaryButton>
            <p className="text-[11px] text-center text-white/50">
              14 días gratis · Sin tarjeta
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}
