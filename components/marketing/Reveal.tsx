"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Reveal-on-scroll: adds `.in` to every `.reveal` element when it enters the
 * viewport (ported from the design's site.js). Re-scans on route change so
 * client navigations between marketing pages animate correctly. If
 * IntersectionObserver is unavailable, everything is revealed immediately.
 */
export default function Reveal() {
  const pathname = usePathname()

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
