
"use client"

import { useState, useEffect } from "react"
export function BackgroundGlow() {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.16),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_22%,rgba(255,255,255,0.04)_45%,rgba(255,255,255,0)_68%,rgba(255,255,255,0.04)_90%)] opacity-30" />
      </>
    )
  }
  
  import Image from "next/image"
  
  export function LogoMark({ size = "md" }: { size?: "md" | "sm" }) {
    const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10"
    return (
      <div className={`relative ${dimension} flex-shrink-0`}>
        <Image
          src="/logo.PNG"
          alt="ClientLabs"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 32px, 40px"
          // will-change para optimizar transform en hover
          style={{ willChange: "transform" }}
        />
      </div>
    )
  }
  

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = [
    { label: "Producto", href: "/producto" },
    { label: "Precios", href: "/precios" },
    { label: "Empresa", href: "/about" },
    { label: "Seguridad", href: "/seguridad" },
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
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/40 transition-all duration-300">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 relative">
        {/* IZQUIERDA - Logo + ClientLabs */}
        <a href="/" className="flex items-center gap-2 text-white group flex-shrink-0 z-50">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <LogoMark />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight">
            Client<span className="text-purple-500">Labs</span>
          </span>
        </a>

        {/* CENTRO - Navigation Links (SOLO DESKTOP) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-8 text-sm text-white/70 lg:flex">
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

        {/* DERECHA - Login + CTA (DESKTOP) / Menú (MOBILE) */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <a
            href="/login"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/80 transition-all duration-200 hover:border-white/40 hover:text-white hover:scale-105 lg:inline-flex"
          >
            Login
          </a>
          <a
            href="/register"
            className="hidden rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:bg-white/90 hover:scale-105 hover:shadow-white/20 lg:inline-flex"
          >
            Empezar
          </a>
          
          {/* Botón menú mobile */}
          <button
            aria-label="Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          >
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"}`} />
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

      {/* Drawer Mobile Premium */}
      <div
        className={`fixed inset-0 top-[var(--nav-height,64px)] z-40 bg-black/95 backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex flex-col px-6 py-8 space-y-1">
            {navItems.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="py-4 px-4 text-lg font-medium text-white/90 rounded-xl transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {item.label}
              </a>
            ))}
            
            <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 px-6 text-center text-base font-semibold text-white/90 rounded-xl border border-white/20 transition-all duration-200 hover:bg-white/10 hover:border-white/40 active:scale-[0.98]"
              >
                Login
              </a>
              <a
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 px-6 text-center text-base font-semibold text-black bg-white rounded-xl transition-all duration-200 hover:bg-white/90 active:scale-[0.98] shadow-lg shadow-white/20"
              >
                Empezar gratis
              </a>
              <p className="text-xs text-center text-white/50 mt-4">
                Sin tarjeta · Cancela cuando quieras
              </p>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  )
}

