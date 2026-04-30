"use client"

import Image from "next/image"

// Navbar unificado — mismo componente que la landing (oscuro, animado, pill on scroll)
export { Navbar } from "@/components/landing/navbar"

/* LogoMark — usado por páginas individuales que lo necesitan aparte del navbar */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension = size === "sm" ? 28 : size === "lg" ? 44 : 36
  return (
    <div className="flex items-center justify-center" style={{ width: dimension, height: dimension }}>
      <Image
        src="/logo-trimmed.png"
        alt="ClientLabs"
        width={dimension}
        height={dimension}
        className="object-contain"
        priority
      />
    </div>
  )
}
