"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"

/* LOGO */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension =
    size === "sm" ? 28 : size === "lg" ? 44 : 36

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src="/logo.PNG"
        alt="ClientLabs"
        width={dimension}
        height={dimension}
        className="object-contain"
        priority
      />
    </div>
  )
}

/* NAVBAR */
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const { data: session } = useSession()

  const navItems = [
    { label: "Producto", href: "/producto" },
    { label: "Precios", href: "/precios" },
    { label: "Soluciones", href: "/soluciones" },
    { label: "Recursos", href: "/recursos" },
    { label: "Contacto", href: "/contacto" },
  ]

  /* cerrar mobile al scroll */
  useEffect(() => {
    if (!isMenuOpen) return
    const close = () => setIsMenuOpen(false)
    window.addEventListener("scroll", close)
    return () => window.removeEventListener("scroll", close)
  }, [isMenuOpen])

  useEffect(() => {
    if (!isUserMenuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [isUserMenuOpen])

  return (
    <nav className="
      fixed top-0 inset-x-0 z-50
      bg-gradient-to-r from-[#0b0f1c]/90 via-[#0f172a]/85 to-[#111827]/80
      backdrop-blur-xl
      border-b border-white/10
      shadow-[0_1px_0_rgba(255,255,255,0.04),0_12px_32px_rgba(2,6,23,0.35)]
    ">
      <div className="w-full px-6 py-4">

        {/* GRID REAL */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">

          {/* IZQUIERDA */}
          <Link
            href="/"
            className="flex items-center gap-2.5 justify-self-start"
          >
            <LogoMark />
            <span className="text-[17px] font-semibold leading-none flex items-center">
              Client<span className="text-purple-400">Labs</span>
            </span>
          </Link>

          {/* CENTRO */}
          <div className="hidden md:flex items-center justify-center gap-10 justify-self-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 hover:text-white transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* DERECHA */}
          <div className="hidden md:flex justify-end items-center gap-4 justify-self-end">
            {!session && (
              <>
                <Link
                  href="/auth"
                  className="text-sm text-white/60 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/auth"
                  className="
                    px-5 py-2 rounded-full
                    bg-gradient-to-r from-purple-500/90 via-indigo-500/90 to-blue-500/90
                    border border-white/10
                    text-sm font-semibold text-white
                    shadow-lg shadow-purple-900/30
                    hover:opacity-90 hover:shadow-purple-900/50 transition
                  "
                >
                  Empezar ahora
                </Link>
              </>
            )}

            {session && (
              <>
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/80 hover:border-white/30 transition"
                    aria-label="Abrir menú de usuario"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "Usuario"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span>
                        {(session.user?.name?.[0] || "U").toUpperCase()}
                      </span>
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-[#0b0f1c]/95 p-2 shadow-2xl backdrop-blur">
                      <Link
                        href="/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                      >
                        Perfil
                      </Link>
                      <Link
                        href="/ajustes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                      >
                        Ajustes
                      </Link>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* MOBILE */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden justify-self-end text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b0f1c]/95">

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-6 py-3 text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          {!session && (
            <>
              <Link
                href="/auth"
                className="block px-6 py-3 text-white/70"
              >
                Login
              </Link>

              <Link
                href="/auth"
                className="block px-6 py-3 text-purple-400 font-semibold"
              >
                Empezar ahora
              </Link>
            </>
          )}

          {session && (
            <>
              <Link
                href="/dashboard"
                className="block px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-500/90 via-indigo-500/90 to-blue-500/90"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/perfil"
                className="block px-6 py-3 text-white/70 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Perfil
              </Link>
              <Link
                href="/ajustes"
                className="block px-6 py-3 text-white/70 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Ajustes
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full px-6 py-3 text-left text-red-300 hover:text-red-200"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}