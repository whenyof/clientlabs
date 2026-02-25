"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import { DashboardButton } from "@/components/DashboardButton"
import { DashboardButtonMobile } from "@/components/DashboardButtonMobile"

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
 bg-[#FFFFFF]
 backdrop-blur-md
 border-b border-[#E2E8ED]
 shadow-sm
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
                        <span className="text-[17px] font-semibold leading-none flex items-center text-[#0F1F2A]">
                            Client<span className="text-[#157A5C]">Labs</span>
                        </span>
                    </Link>

                    {/* CENTRO */}
                    <div className="hidden md:flex items-center justify-center gap-10 justify-self-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-[#5F7280] hover:text-[#157A5C] transition"
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
                                    className="text-sm text-[#5F7280] hover:text-[#0F1F2A]"
                                >
                                    Login
                                </Link>

                                <Link
                                    href="/auth"
                                    className="
 px-5 py-2 rounded-full
 bg-[#157A5C] hover:bg-[#1FA97A] text-white
 border border-transparent
 text-sm font-semibold
 shadow-sm
 hover:opacity-90 hover:shadow-sm transition
 "
                                >
                                    Empezar ahora
                                </Link>
                            </>
                        )}

                        {session && (
                            <>
                                {/* Dashboard Button - appears when authenticated */}
                                <DashboardButton />

                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-sidebar)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)]-primary transition"
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
                                        <div className="absolute right-0 mt-3 w-48 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-sm backdrop-blur">
                                            <Link
                                                href="/perfil"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                                            >
                                                Perfil
                                            </Link>
                                            <Link
                                                href="/ajustes"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)]"
                                            >
                                                Ajustes
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--critical)] hover:bg-[var(--bg-card)]"
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
                <div className="md:hidden border-t border-[#E2E8ED] bg-[#FFFFFF]">

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-6 py-3 text-[#5F7280] hover:text-[#0F1F2A]"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {!session && (
                        <>
                            <Link
                                href="/auth"
                                className="block px-6 py-3 text-[#5F7280]"
                            >
                                Login
                            </Link>

                            <Link
                                href="/auth"
                                className="block px-6 py-3 text-[#157A5C] font-semibold"
                            >
                                Empezar ahora
                            </Link>
                        </>
                    )}

                    {session && (
                        <>
                            <DashboardButtonMobile onClick={() => setIsMenuOpen(false)} />
                            <Link
                                href="/perfil"
                                className="block px-6 py-3 text-[#5F7280] hover:text-[#0F1F2A]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Perfil
                            </Link>
                            <Link
                                href="/ajustes"
                                className="block px-6 py-3 text-[#5F7280] hover:text-[#0F1F2A]"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Ajustes
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="block w-full px-6 py-3 text-left text-[var(--critical)] hover:text-[var(--critical)]"
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