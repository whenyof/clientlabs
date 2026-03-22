"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { loadOpenCV } from "@opencvjs/web"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish?: () => void
  pageCount?: number
}

type Point2D = { x: number; y: number }

function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Order quad: top-left, top-right, bottom-right, bottom-left */
function orderQuadPoints(pts: Point2D[]): [Point2D, Point2D, Point2D, Point2D] {
  const tl = pts.reduce((a, b) => (a.x + a.y < b.x + b.y ? a : b))
  const br = pts.reduce((a, b) => (a.x + a.y > b.x + b.y ? a : b))
  const rest = pts.filter((p) => p !== tl && p !== br)
  if (rest.length !== 2) {
    const s = [...pts].sort((a, b) => a.y - b.y)
    const top = s.slice(0, 2).sort((a, b) => a.x - b.x)
    const bottom = s.slice(2, 4).sort((a, b) => a.x - b.x)
    return [top[0], top[1], bottom[1], bottom[0]]
  }
  const tr = rest[0].y <= rest[1].y ? rest[0] : rest[1]
  const bl = rest[0].y <= rest[1].y ? rest[1] : rest[0]
  return [tl, tr, br, bl]
}

const CORNER_ARM_PX = 25

function drawCornerArm(
  ctx: CanvasRenderingContext2D,
  from: Point2D,
  toward: Point2D,
  maxLen: number,
) {
  const d = distance(from, toward)
  if (d < 1) return
  const len = Math.min(maxLen, d * 0.99)
  const t = len / d
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(from.x + (toward.x - from.x) * t, from.y + (toward.y - from.y) * t)
  ctx.stroke()
}

/** iPhone-style L corners on ordered quad TL → TR → BR → BL */
function drawPremiumCorners(
  ctx: CanvasRenderingContext2D,
  quad: Point2D[],
  options: {
    color: string
    lineWidth: number
    shadowBlur: number
    shadowColor: string
    globalAlpha: number
  },
) {
  if (quad.length !== 4) return
  const [tl, tr, br, bl] = orderQuadPoints(quad)
  ctx.save()
  ctx.globalAlpha = options.globalAlpha
  ctx.strokeStyle = options.color
  ctx.lineWidth = options.lineWidth
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.shadowColor = options.shadowColor
  ctx.shadowBlur = options.shadowBlur
  drawCornerArm(ctx, tl, tr, CORNER_ARM_PX)
  drawCornerArm(ctx, tl, bl, CORNER_ARM_PX)
  drawCornerArm(ctx, tr, tl, CORNER_ARM_PX)
  drawCornerArm(ctx, tr, br, CORNER_ARM_PX)
  drawCornerArm(ctx, br, tr, CORNER_ARM_PX)
  drawCornerArm(ctx, br, bl, CORNER_ARM_PX)
  drawCornerArm(ctx, bl, br, CORNER_ARM_PX)
  drawCornerArm(ctx, bl, tl, CORNER_ARM_PX)
  ctx.restore()
}

const SCAN_SWEEP_MS = 2200

function drawScanningSweepLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  isReady: boolean,
) {
  const t = (performance.now() % SCAN_SWEEP_MS) / SCAN_SWEEP_MS
  const y = t * height
  const pulse = Math.sin(Date.now() / 120) * 0.5 + 0.5
  ctx.save()
  ctx.globalAlpha = isReady ? 0.6 * (0.85 + pulse * 0.15) : 0.6
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.shadowColor = color
  ctx.shadowBlur = isReady ? 22 : 10
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(width, y)
  ctx.stroke()
  ctx.restore()
}

async function warpDocumentToBlob(cv: any, video: HTMLVideoElement, quad: Point2D[]): Promise<Blob | null> {
  if (quad.length !== 4) return null

  const [tl, tr, br, bl] = orderQuadPoints(quad)
  const wTop = distance(tl, tr)
  const wBot = distance(bl, br)
  const hLeft = distance(tl, bl)
  const hRight = distance(tr, br)
  const outW = Math.max(2, Math.round(Math.max(wTop, wBot)))
  const outH = Math.max(2, Math.round(Math.max(hLeft, hRight)))

  let srcMat: any = null
  let warped: any = null
  let upscaled: any = null
  let blurMat: any = null
  let sharpened: any = null
  let M: any = null
  let srcTri: any = null
  let dstTri: any = null

  const UPSCALE = 2

  try {
    const tempCanvas = document.createElement("canvas")
    const vw = video.videoWidth
    const vh = video.videoHeight
    tempCanvas.width = vw
    tempCanvas.height = vh
    const ctx = tempCanvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, vw, vh)

    srcMat = cv.imread(tempCanvas)

    srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      tl.x,
      tl.y,
      tr.x,
      tr.y,
      br.x,
      br.y,
      bl.x,
      bl.y,
    ])
    dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      outW - 1,
      0,
      outW - 1,
      outH - 1,
      0,
      outH - 1,
    ])
    M = cv.getPerspectiveTransform(srcTri, dstTri)
    warped = new cv.Mat()
    cv.warpPerspective(srcMat, warped, M, new cv.Size(outW, outH), cv.INTER_LINEAR)

    // Orientation: match warped aspect to contour bbox (longest extent in frame).
    const width = warped.cols
    const height = warped.rows
    const xs = quad.map((p) => p.x)
    const ys = quad.map((p) => p.y)
    const bboxW = Math.max(...xs) - Math.min(...xs)
    const bboxH = Math.max(...ys) - Math.min(...ys)
    const preferPortrait = bboxH > bboxW * 1.05
    const preferLandscape = bboxW > bboxH * 1.05

    let needsRotate = false
    if (preferPortrait) {
      // Vertical document in frame → expect portrait output (height > width * 1.2).
      if (!(height > width * 1.2)) {
        needsRotate = true
      }
    } else if (preferLandscape) {
      // Horizontal document → expect landscape (width > height * 1.2).
      if (!(width > height * 1.2)) {
        needsRotate = true
      }
    } else {
      // Ambiguous bbox: use pixel rule from spec.
      if (!(height > width * 1.2)) {
        needsRotate = true
      }
    }

    if (needsRotate) {
      const rotated = new cv.Mat()
      cv.rotate(warped, rotated, cv.ROTATE_90_CLOCKWISE)
      warped.delete()
      warped = rotated
    }

    const upCols = Math.max(2, Math.round(warped.cols * UPSCALE))
    const upRows = Math.max(2, Math.round(warped.rows * UPSCALE))
    upscaled = new cv.Mat()
    cv.resize(warped, upscaled, new cv.Size(upCols, upRows), 0, 0, cv.INTER_CUBIC)
    warped.delete()
    warped = null

    blurMat = new cv.Mat()
    cv.GaussianBlur(upscaled, blurMat, new cv.Size(3, 3), 0)
    sharpened = new cv.Mat()
    cv.addWeighted(upscaled, 1.25, blurMat, -0.25, 0, sharpened)
    upscaled.delete()
    upscaled = null
    blurMat.delete()
    blurMat = null

    const outCanvas = document.createElement("canvas")
    outCanvas.width = sharpened.cols
    outCanvas.height = sharpened.rows
    cv.imshow(outCanvas, sharpened)
    sharpened.delete()
    sharpened = null

    return await new Promise<Blob | null>((res) => outCanvas.toBlob((b) => res(b), "image/jpeg", 1))
  } finally {
    srcMat?.delete()
    warped?.delete()
    upscaled?.delete()
    blurMat?.delete()
    sharpened?.delete()
    M?.delete()
    srcTri?.delete()
    dstTri?.delete()
  }
}

export function LiveScanner({ onCapture, onCancel }: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const cvRef = useRef<Awaited<ReturnType<typeof loadOpenCV>> | null>(null)
  const contourRef = useRef<Point2D[] | null>(null)
  const lastContourRef = useRef<Point2D[] | null>(null)
  const stableFramesRef = useRef(0)
  const frameCountRef = useRef(0)
  const autoCaptureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCaptureTimeRef = useRef(0)
  const isAutoCapturingRef = useRef(false)
  const handleCaptureRef = useRef<() => Promise<void>>(() => Promise.resolve())
  const [flash, setFlash] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const [scannerReady, setScannerReady] = useState(false)
  const wasReadyRef = useRef(false)

  const detectDocument = useCallback(() => {
    const cv = cvRef.current
    const video = videoRef.current
    const overlay = overlayRef.current

    if (!cv || !video || !overlay || video.videoWidth === 0) return

    const w = video.videoWidth
    const h = video.videoHeight

    let src: any = null
    let gray: any = null
    let blurred: any = null
    let edges: any = null
    let contours: any = null
    let hierarchy: any = null

    try {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = w
      tempCanvas.height = h
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0, w, h)

      src = cv.imread(tempCanvas)
      gray = new cv.Mat()
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
      blurred = new cv.Mat()
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
      edges = new cv.Mat()
      cv.Canny(blurred, edges, 75, 200)
      contours = new cv.MatVector()
      hierarchy = new cv.Mat()
      cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

      let best: Point2D[] | null = null
      let bestArea = 0
      const minArea = w * h * 0.2

      for (let i = 0; i < contours.size(); i++) {
        const c = contours.get(i)
        const area = cv.contourArea(c)
        if (area < minArea) {
          c.delete()
          continue
        }
        const approx = new cv.Mat()
        cv.approxPolyDP(c, approx, 0.02 * cv.arcLength(c, true), true)
        if (approx.rows === 4) {
          const pts: Point2D[] = []
          for (let j = 0; j < 4; j++) {
            pts.push({
              x: approx.data32S[j * 2],
              y: approx.data32S[j * 2 + 1],
            })
          }
          if (area > bestArea) {
            best = pts
            bestArea = area
          }
        }
        approx.delete()
        c.delete()
      }

      contourRef.current = best

      if (best) {
        lastContourRef.current = best
        stableFramesRef.current = Math.min(stableFramesRef.current + 3, 10)
      } else {
        stableFramesRef.current = Math.max(stableFramesRef.current - 1, 0)
      }
      const isReady = stableFramesRef.current >= 5

      if (isReady && !wasReadyRef.current) {
        navigator.vibrate?.(30)
      }
      wasReadyRef.current = isReady
      setScannerReady((prev) => (prev === isReady ? prev : isReady))

      const contourToDraw = best ?? lastContourRef.current

      const now = Date.now()
      const canCapture =
        isReady &&
        !isAutoCapturingRef.current &&
        now - lastCaptureTimeRef.current > 1200

      if (canCapture && !autoCaptureTimeoutRef.current) {
        autoCaptureTimeoutRef.current = setTimeout(() => {
          setIsCountingDown(false)
          isAutoCapturingRef.current = true
          handleCaptureRef.current()
          lastCaptureTimeRef.current = Date.now()
          setTimeout(() => {
            isAutoCapturingRef.current = false
          }, 1000)
          autoCaptureTimeoutRef.current = null
        }, 400)
        setIsCountingDown(true)
      }

      if (!isReady && autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current)
        autoCaptureTimeoutRef.current = null
        setIsCountingDown(false)
      }

      overlay.width = w
      overlay.height = h
      const ovCtx = overlay.getContext("2d")
      if (!ovCtx) return
      ovCtx.clearRect(0, 0, w, h)

      const stateColor = isReady ? "#22c55e" : "#eab308"
      drawScanningSweepLine(ovCtx, w, h, stateColor, isReady)

      // RED / nothing: no contour → only sweep line
      if (!contourToDraw || contourToDraw.length !== 4) {
        return
      }
      const pulse = Math.sin(Date.now() / 120) * 0.5 + 0.5
      const cornerAlpha = isReady ? 0.8 + pulse * 0.2 : 1
      drawPremiumCorners(ovCtx, contourToDraw, {
        color: stateColor,
        lineWidth: isReady ? 4 : 2,
        shadowBlur: isReady ? 25 : 10,
        shadowColor: isReady ? "#22c55e" : "#eab308",
        globalAlpha: cornerAlpha,
      })
    } finally {
      src?.delete()
      gray?.delete()
      blurred?.delete()
      edges?.delete()
      contours?.delete()
      hierarchy?.delete()
    }
  }, [])

  useEffect(() => {
    handleCaptureRef.current = handleCapture
  })

  useEffect(() => {
    loadOpenCV()
      .then((cv) => {
        cvRef.current = cv
      })
      .catch(() => {
        console.warn("OpenCV failed, continue without detection")
      })
  }, [])

  useEffect(() => {
    return () => {
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let animationId: number
    const loop = () => {
      frameCountRef.current += 1
      if (frameCountRef.current % 4 !== 0) {
        animationId = requestAnimationFrame(loop)
        return
      }
      detectDocument()
      animationId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animationId)
  }, [detectDocument])

  const handleCapture = async () => {
    setFlash(true)
    setIsPressed(true)
    navigator.vibrate?.(50)
    setTimeout(() => {
      setFlash(false)
      setIsPressed(false)
    }, 120)

    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const cv = cvRef.current
    const quad = contourRef.current ?? lastContourRef.current

    let blob: Blob | null = null
    if (cv && quad && quad.length === 4) {
      try {
        blob = await warpDocumentToBlob(cv, video, quad)
      } catch {
        blob = null
      }
    }

    if (!blob) {
      const canvas = document.createElement("canvas")
      const vw = video.videoWidth
      const vh = video.videoHeight
      canvas.width = vw
      canvas.height = vh

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0, vw, vh)

      blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", 1)
      )
    }

    if (blob) {
      onCapture(blob)
      setShowAdded(true)
      setTimeout(() => setShowAdded(false), 800)
    }
  }

  useEffect(() => {
    let stream: MediaStream | null = null

    const start = async () => {
      const video = videoRef.current
      if (!video) return

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.style.objectFit = "cover"
      await video.play()
    }

    start()

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 999999,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          transform: scannerReady ? "scale(1.02)" : "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: scannerReady
              ? "inset 0 0 0 1000px rgba(0,0,0,0.28), inset 0 0 100px rgba(34,197,94,0.1)"
              : "inset 0 0 0 1000px rgba(0,0,0,0.35)",
            transition: "box-shadow 0.45s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "80%",
            height: "60%",
            transform: "translate(-50%, -50%)",
            borderRadius: "16px",
            border: scannerReady
              ? "1px dashed rgba(134,239,172,0.7)"
              : "1px dashed rgba(255,255,255,0.4)",
            boxShadow: scannerReady ? "0 0 40px rgba(34,197,94,0.3)" : "none",
            transition: "border-color 0.45s ease, box-shadow 0.45s ease",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "max(20px, env(safe-area-inset-top, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "white",
          zIndex: 50,
          pointerEvents: "none",
          maxWidth: "90%",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.8, lineHeight: 1.35 }}>
          Coloca el documento dentro del marco
        </div>
        <div
          style={{
            marginTop: "6px",
            fontSize: "14px",
            fontWeight: 600,
            opacity: 0.95,
            color: scannerReady ? "#86efac" : "rgba(255,255,255,0.92)",
            transition: "color 0.35s ease",
          }}
        >
          {scannerReady ? "Listo para capturar" : "Buscando documento..."}
        </div>
      </div>
      <canvas
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          zIndex: 11,
        }}
      />
      {flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: 0.8,
            pointerEvents: "none",
            zIndex: 99999,
          }}
        />
      )}
      {isCountingDown && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "999px",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        >
          Capturando...
        </div>
      )}
      {showAdded && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "999px",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        >
          Página añadida
        </div>
      )}
      <button
        type="button"
        onClick={onCancel}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: "8px",
          zIndex: 1000000,
          pointerEvents: "auto",
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>
      <button
        type="button"
        onClick={handleCapture}
        style={{
          position: "absolute",
          bottom: "30px",
          left: "50%",
          transform: isPressed ? "translateX(-50%) scale(0.9)" : "translateX(-50%) scale(1)",
          transition: "transform 0.1s",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "white",
          zIndex: 1000000,
          pointerEvents: "auto",
        }}
      />
    </div>
  )
}
