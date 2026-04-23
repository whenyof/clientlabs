"use client"
import { useEffect, useRef, useState } from "react"

export function ClientLabsAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [fired, setFired] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          setFired(true)
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage("start", window.location.origin)
          }, 200)
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fired])

  return (
    <div
      ref={ref}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: "600px" }}
    >
      <iframe
        ref={iframeRef}
        src="/animation/clientlabs.html"
        className="w-full h-full border-0"
        style={{ background: "transparent" }}
        title="Demo ClientLabs"
        loading="lazy"
      />
    </div>
  )
}
