"use client"

import { useEffect, useRef, useState } from "react"

interface EmailThumbnailProps {
  html: string
  name: string
  height?: number
}

export function EmailThumbnail({ html, name, height = 220 }: EmailThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale(el.clientWidth / 600)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [])

  const iframeHeight = Math.ceil(height / scale)

  const THUMB_STYLE = `<style>
    html,body{margin:0!important;padding:0!important;background:#f0f4f8;min-height:100%;}
    table[width="100%"]>tbody>tr>td{padding:0!important;}
  </style>`
  const srcDoc = html.includes("</head>")
    ? html.replace("</head>", THUMB_STYLE + "</head>")
    : `<!DOCTYPE html><html><head><meta charset="utf-8"/>${THUMB_STYLE}</head><body>${html}</body></html>`

  return (
    <div ref={containerRef} style={{ height, background: "#f0f4f8", overflow: "hidden", position: "relative" }}>
      <iframe
        srcDoc={srcDoc}
        style={{
          width: 600,
          height: iframeHeight,
          border: "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          display: "block",
        }}
        sandbox="allow-same-origin"
        title={name}
      />
    </div>
  )
}
