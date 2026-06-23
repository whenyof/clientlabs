"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { MARKETING_NAV, LOGIN_HREF, START_HREF } from "@/lib/site-config"
import { Menu } from "./icons"

function BrandMark() {
  return (
    <span className="mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { status } = useSession()
  // status: "loading" (sin resolver) | "authenticated" | "unauthenticated"
  const ready = status !== "loading"
  const authed = status === "authenticated"
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Cierre de pre-lanzamiento: los CTA de auth siguen visibles pero, al pulsarlos,
  // muestran un aviso en lugar de navegar a /auth o /precios. El bloqueo real es
  // de servidor (registro/login); esto es solo la capa cosmética del navbar.
  const [lock, setLock] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!lock) return
    const hide = () => setLock(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLock(false)
    }
    const timeout = window.setTimeout(() => setLock(false), 4500)
    // Registramos el cierre por clic en el siguiente tick para que el propio
    // clic que abre el aviso no lo cierre de inmediato.
    const attach = window.setTimeout(() => document.addEventListener("click", hide), 0)
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(timeout)
      clearTimeout(attach)
      document.removeEventListener("click", hide)
      document.removeEventListener("keydown", onKey)
    }
  }, [lock])

  // Intercepta los CTA de auth: no navega, cierra el menú móvil y muestra el aviso.
  const showLock = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setOpen(false)
    setLock(true)
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="ClientLabs — inicio">
          <BrandMark />
          <span>ClientLabs</span>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          {MARKETING_NAV.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          {ready && !authed && (
            <a href={LOGIN_HREF} className="signin" onClick={showLock}>
              Iniciar sesión
            </a>
          )}
          {!ready ? (
            <span className="nav-cta-skeleton" aria-hidden="true" />
          ) : authed ? (
            <a href="/dashboard" className="btn btn-primary">
              Dashboard
            </a>
          ) : (
            <a href={START_HREF} className="btn btn-primary" onClick={showLock}>
              Empieza gratis
            </a>
          )}
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobileMenu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu width={22} height={22} />
          </button>
        </div>
      </div>

      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        <div className="mm-inner">
          {MARKETING_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="mm-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {ready && !authed && (
            <a href={LOGIN_HREF} className="mm-link" onClick={showLock}>
              Iniciar sesión
            </a>
          )}
          {!ready ? (
            <span className="nav-cta-skeleton-lg" aria-hidden="true" />
          ) : authed ? (
            <a href="/dashboard" className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>
              Dashboard
            </a>
          ) : (
            <a href={START_HREF} className="btn btn-primary btn-lg" onClick={showLock}>
              Empieza gratis
            </a>
          )}
        </div>
      </div>

      {lock && (
        <div className="nav-lock-toast" role="status" aria-live="polite" onClick={(e) => e.stopPropagation()}>
          <span className="nav-lock-dot" aria-hidden="true" />
          Abrimos el 1 de julio — te avisaremos por email.
        </div>
      )}
    </header>
  )
}
