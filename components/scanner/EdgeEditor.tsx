/* Edge editor (manual corner refinement) */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export type CornerPoint = { x: number; y: number }

export type EdgeEditorProps = {
  image: string
  initialCorners?: [CornerPoint, CornerPoint, CornerPoint, CornerPoint]
  onConfirm: (points: [CornerPoint, CornerPoint, CornerPoint, CornerPoint]) => void
  onCancel: () => void
}

type DragState = { index: number; pointerId: number } | null

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function EdgeEditor({ image, initialCorners, onConfirm, onCancel }: EdgeEditorProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const dragRef = useRef<DragState>(null)

  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null)
  const [points, setPoints] = useState<[CornerPoint, CornerPoint, CornerPoint, CornerPoint]>(() => [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])

  const handleRadiusPx = 10
  const lineColor = "#00FFAA"

  const normalizedInitial = useMemo(() => {
    if (initialCorners) return initialCorners
    if (!imgDims) return null

    const { w, h } = imgDims
    const padX = w * 0.08
    const padY = h * 0.08

    const tl = { x: padX, y: padY }
    const tr = { x: w - padX, y: padY }
    const br = { x: w - padX, y: h - padY }
    const bl = { x: padX, y: h - padY }
    return [tl, tr, br, bl] as const
  }, [initialCorners, imgDims])

  useEffect(() => {
    if (!normalizedInitial) return
    setPoints(normalizedInitial)
  }, [normalizedInitial])

  useEffect(() => {
    const imgEl = imgRef.current
    if (!imgEl) return

    if (imgEl.complete && imgEl.naturalWidth && imgEl.naturalHeight) {
      setImgDims({ w: imgEl.naturalWidth, h: imgEl.naturalHeight })
      return
    }

    const onLoad = () => {
      if (!imgEl.naturalWidth || !imgEl.naturalHeight) return
      setImgDims({ w: imgEl.naturalWidth, h: imgEl.naturalHeight })
    }

    imgEl.addEventListener("load", onLoad)
    return () => imgEl.removeEventListener("load", onLoad)
  }, [image])

  useEffect(() => {
    const canvas = canvasRef.current
    const imgEl = imgRef.current
    if (!canvas || !imgEl) return
    if (!imgDims) return

    const syncSize = () => {
      const rect = imgEl.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      canvas.width = w
      canvas.height = h
      draw()
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const cw = canvas.width
      const ch = canvas.height
      ctx.clearRect(0, 0, cw, ch)

      const { w: iw, h: ih } = imgDims
      const sx = cw / iw
      const sy = ch / ih

      const [tl, tr, br, bl] = points

      // Quad lines.
      ctx.lineWidth = 2
      ctx.strokeStyle = lineColor
      ctx.beginPath()
      ctx.moveTo(tl.x * sx, tl.y * sy)
      ctx.lineTo(tr.x * sx, tr.y * sy)
      ctx.lineTo(br.x * sx, br.y * sy)
      ctx.lineTo(bl.x * sx, bl.y * sy)
      ctx.closePath()
      ctx.stroke()

      // Handles.
      const handles: CornerPoint[] = [tl, tr, br, bl]
      for (const p of handles) {
        const hx = p.x * sx
        const hy = p.y * sy

        ctx.fillStyle = lineColor
        ctx.beginPath()
        ctx.arc(hx, hy, handleRadiusPx, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const onResize = () => syncSize()
    window.addEventListener("resize", onResize)

    syncSize()

    return () => {
      window.removeEventListener("resize", onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgDims, points])

  const scheduleDraw = () => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      // Redraw via effect by touching state? We'll directly call minimal draw:
      // For simplicity we rely on effect dependency [points]; this schedule is just to keep it responsive.
      // No-op here intentionally.
    })
  }

  const getPointerPosInImage = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const imgEl = imgRef.current
    if (!canvas || !imgEl || !imgDims) return null

    const rect = canvas.getBoundingClientRect()
    const xCss = e.clientX - rect.left
    const yCss = e.clientY - rect.top

    const sx = imgDims.w / canvas.width
    const sy = imgDims.h / canvas.height

    return {
      x: clamp(xCss * sx, 0, imgDims.w),
      y: clamp(yCss * sy, 0, imgDims.h),
    }
  }

  const pickHandleIndex = (e: React.PointerEvent) => {
    if (!imgDims) return null
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const cw = canvas.width
    const ch = canvas.height

    const sx = cw / imgDims.w
    const sy = ch / imgDims.h

    const clickX = (e.clientX - rect.left) // in css px
    const clickY = (e.clientY - rect.top)

    // Convert click to canvas px.
    const canvasX = (clickX / rect.width) * cw
    const canvasY = (clickY / rect.height) * ch

    const [tl, tr, br, bl] = points
    const handles = [tl, tr, br, bl]
    const radi = handleRadiusPx * 1.35
    for (let i = 0; i < 4; i++) {
      const hx = handles[i].x * sx
      const hy = handles[i].y * sy
      const d = Math.hypot(canvasX - hx, canvasY - hy)
      if (d <= radi) return i
    }
    return null
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!imgDims) return
    const idx = pickHandleIndex(e)
    if (idx === null) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { index: idx, pointerId: e.pointerId }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    if (!imgDims) return

    const pos = getPointerPosInImage(e)
    if (!pos) return

    setPoints((prev) => {
      const copy = [...prev] as [CornerPoint, CornerPoint, CornerPoint, CornerPoint]
      copy[drag.index] = { x: pos.x, y: pos.y }
      return copy
    })
    scheduleDraw()
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    e.preventDefault()
    dragRef.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-lg p-3 shadow-lg">
        <div className="relative w-full">
          <img ref={imgRef} src={image} alt="Editor de bordes" className="w-full h-auto rounded" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ touchAction: "none" }}
          />
        </div>

        <div className="flex gap-2 mt-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[var(--accent)] text-white hover:opacity-90"
            onClick={() => onConfirm(points)}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  )
}

