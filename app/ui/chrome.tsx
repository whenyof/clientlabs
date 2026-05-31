"use client"

import { Logo } from "@/components/Logo"

// Navbar unificado — mismo componente que la landing (oscuro, animado, pill on scroll)
export { Navbar } from "@/components/landing/navbar"

/* LogoMark — usado por páginas individuales que lo necesitan aparte del navbar */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension = size === "sm" ? 28 : size === "lg" ? 44 : 36
  return (
    <div className="flex items-center justify-center" style={{ width: dimension, height: dimension }}>
      <Logo
        variant="icon-solid-green"
        width={dimension}
        height={dimension}
        priority
      />
    </div>
  )
}
