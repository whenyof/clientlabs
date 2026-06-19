"use client"

import { useEffect, useState } from "react"
import { PREVIEW_URL } from "@/lib/site-config"

const MODULES = [
  { id: "clientes", n: "01", label: "Clientes y ventas" },
  { id: "facturacion", n: "02", label: "Facturación" },
  { id: "operativa", n: "03", label: "Operativa" },
  { id: "crecimiento", n: "04", label: "Crecimiento" },
]

/** Sticky module index with scroll-spy that highlights the section in view. */
export default function ProductIndex() {
  const [active, setActive] = useState(MODULES[0].id)

  useEffect(() => {
    const sections = MODULES.map((m) => document.getElementById(m.id)).filter(
      (el): el is HTMLElement => !!el
    )
    if (!sections.length || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <aside className="pindex" aria-label="Índice de módulos">
      <div className="ix-label">Módulos</div>
      {MODULES.map((m) => (
        <a key={m.id} href={`#${m.id}`} className={active === m.id ? "on" : undefined}>
          <span className="ix-n">{m.n}</span> {m.label}
        </a>
      ))}
      <div className="ix-cta">
        <a href={PREVIEW_URL} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Empieza gratis
        </a>
      </div>
    </aside>
  )
}
