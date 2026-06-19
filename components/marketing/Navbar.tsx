"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MARKETING_NAV, PREVIEW_URL } from "@/lib/site-config"
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
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
          <a href={PREVIEW_URL} className="signin">
            Iniciar sesión
          </a>
          <a href={PREVIEW_URL} className="btn btn-primary">
            Empieza gratis
          </a>
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
          <a href={PREVIEW_URL} className="mm-link" onClick={() => setOpen(false)}>
            Iniciar sesión
          </a>
          <a href={PREVIEW_URL} className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>
            Empieza gratis
          </a>
        </div>
      </div>
    </header>
  )
}
