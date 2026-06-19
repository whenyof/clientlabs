"use client"

import { useEffect, useState } from "react"
import { START_HREF } from "@/lib/site-config"

const MODULES = [
  { id: "clientes", n: "01", label: "Clientes y ventas" },
  { id: "facturacion", n: "02", label: "Facturación" },
  { id: "operativa", n: "03", label: "Operativa" },
  { id: "crecimiento", n: "04", label: "Crecimiento" },
]

/**
 * Sticky module index with scroll-spy. The IntersectionObserver uses a thin
 * horizontal "active band" near the top of the viewport (top ~28%–40%): a
 * module is considered current while its body crosses that band, and the
 * topmost module in the band (document order) wins. This avoids the jitter of
 * ratio-based spies when modules have very different heights.
 */
export default function ProductIndex() {
  const [active, setActive] = useState(MODULES[0].id)

  useEffect(() => {
    const sections = MODULES.map((m) => document.getElementById(m.id)).filter(
      (el): el is HTMLElement => !!el
    )
    if (!sections.length || !("IntersectionObserver" in window)) return

    const inBand = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id)
          else inBand.delete(e.target.id)
        }
        // First module (document order) currently crossing the band.
        const current = MODULES.find((m) => inBand.has(m.id))
        if (current) setActive(current.id)
      },
      { rootMargin: "-28% 0px -60% 0px", threshold: 0 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <aside className="pindex" aria-label="Índice de módulos">
      <div className="pindex-inner">
        <div className="ix-label">Módulos</div>
        {MODULES.map((m) => (
          <a key={m.id} href={`#${m.id}`} className={active === m.id ? "on" : undefined}>
            <span className="ix-n">{m.n}</span> {m.label}
          </a>
        ))}
        <div className="ix-cta">
          <a href={START_HREF} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Empieza gratis
          </a>
        </div>
      </div>
    </aside>
  )
}
