/* Live camera scanner (V1): getUserMedia preview + capture to Blob */
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export type LiveScannerProps = {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  onFinish: () => void
  pageCount: number
}

export function LiveScanner({ onCapture, onCancel, onFinish, pageCount }: LiveScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  /** Full-resolution frame for manual/auto capture only (never shared with detection). */
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  /** Small downscaled frame for OpenCV detection only — avoids racing capture canvas. */
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const [capturePressed, setCapturePressed] = useState(false)
  const capturingRef = useRef(false)
  const detectBusyRef = useRef(false)
  const openCvPromiseRef = useRef<Promise<any> | null>(null)
  const detectedContourRef = useRef<any>(null)
  const lastAreaRef = useRef(0)
  const noContourFramesRef = useRef(0)
  const smoothedContourRef = useRef<any>(null)
  const detectionStableRef = useRef(0)

  // Auto capture (Phase 4).
  const autoCaptureTimeoutRef = useRef<any>(null)
  const lastCaptureTimeRef = useRef(0)
  const isAutoCapturingRef = useRef(false)
  const flashTimeoutRef = useRef<any>(null)
  const isCountingDownRef = useRef(false)
  const showAddedTimeoutRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const pageCountRef = useRef(pageCount)
  const autoCaptureBlockUntilRef = useRef(0)

  /** Ready / lock threshold (aligned with auto-capture). */
  const READY_STABLE_THRESHOLD = 3

  useEffect(() => {
    pageCountRef.current = pageCount
  }, [pageCount])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      isAutoCapturingRef.current = false
      capturingRef.current = false
      isCountingDownRef.current = false
    }
  }, [])

  const loadOpenCV = () =>
    (openCvPromiseRef.current ??= new Promise((resolve) => {
      const w = window as any
      if (w.cv) return resolve(w.cv)

      const script = document.createElement("script")
      script.src = "https://docs.opencv.org/4.x/opencv.js"
      script.async = true

      script.onload = () => {
        // opencv.js sets `cv` and `cv.onRuntimeInitialized` is called once ready.
        w.cv = w.cv ?? w.cv
        w.cv.onRuntimeInitialized = () => resolve(w.cv)

        // If runtime is already initialized, resolve immediately.
        if (w.cv && w.cv.getBuildInformation) resolve(w.cv)
      }

      script.onerror = () => {
        if (!isMountedRef.current) return
        setError("No se pudo cargar OpenCV para detectar el documento")
      }

      document.body.appendChild(script)
    }))

  const drawOverlay = (contour: any, overlay: HTMLCanvasElement, w: number, h: number) => {
    const ctx = overlay.getContext("2d")
    if (!ctx) return

    // Fit overlay canvas to actual size.
    const overlayW = overlay.clientWidth || overlay.width
    const overlayH = overlay.clientHeight || overlay.height
    if (!overlayW || !overlayH) return

    overlay.width = overlayW
    overlay.height = overlayH

    ctx.clearRect(0, 0, overlayW, overlayH)

    // Scanner feel: mask background around the guide rectangle.
    const pad = Math.max(10, Math.round(Math.min(overlayW, overlayH) * 0.08))
    ctx.fillStyle = "rgba(0,0,0,0.4)"
    ctx.fillRect(0, 0, overlayW, overlayH)
    ctx.clearRect(pad, pad, overlayW - pad * 2, overlayH - pad * 2)

    const isReady = detectionStableRef.current >= READY_STABLE_THRESHOLD
    const isCountingDown = isCountingDownRef.current
    const hasContour = Boolean(contour)

    // Guide (always visible) — stronger “locked” look when ready (iPhone Notes–style).
    ctx.lineWidth = isCountingDown ? 6 : isReady ? 5 : 2
    ctx.setLineDash([10, 6])
    ctx.strokeStyle = isCountingDown ? "#00FFAA" : isReady ? "#00FFAA" : "#FFFFFF"
    if (isReady && !isCountingDown) {
      ctx.shadowColor = "#00FFAA"
      ctx.shadowBlur = 14
    } else {
      ctx.shadowBlur = 0
    }
    ctx.strokeRect(pad, pad, overlayW - pad * 2, overlayH - pad * 2)
    ctx.setLineDash([])
    ctx.shadowBlur = 0

    // UX text feedback.
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    if (isCountingDown) {
      ctx.fillStyle = "#00FFAA"
      ctx.font = "800 16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      ctx.fillText("Capturando...", overlayW / 2, 8)
    } else if (isReady) {
      ctx.fillStyle = "#00FFAA"
      ctx.font = "700 15px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      ctx.fillText("Documento listo", overlayW / 2, 8)
    } else if (hasContour) {
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      ctx.fillText("Mantén el móvil estable", overlayW / 2, 8)
    } else {
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      ctx.fillText("Ajusta el documento", overlayW / 2, 8)
    }

    if (!contour) return

    // Draw contour on top (solid).
    ctx.globalAlpha = 0.95
    ctx.strokeStyle = "#00FFAA"
    if (isReady) {
      ctx.lineWidth = 5
      ctx.shadowColor = "#00FFAA"
      ctx.shadowBlur = 14
    } else {
      ctx.lineWidth = 3
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
    }
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const x = contour.intPtr(i, 0)[0] * (overlayW / w)
      const y = contour.intPtr(i, 0)[1] * (overlayH / h)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()

    // Optional corner highlight.
    ctx.fillStyle = "#00FFAA"
    const cornerR = isReady ? 5 : 4
    for (let i = 0; i < 4; i++) {
      const x = contour.intPtr(i, 0)[0] * (overlayW / w)
      const y = contour.intPtr(i, 0)[1] * (overlayH / h)
      ctx.beginPath()
      ctx.arc(x, y, cornerR, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }

  useEffect(() => {
    let mounted = true

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("MediaDevices no disponible")
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Some browsers require play() to begin the stream.
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setError("No se pudo acceder a la cámara")
      }
    }

    start()

    return () => {
      mounted = false
      const stream = streamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    let interval: any
    let cancelled = false

    const startDetection = async () => {
      try {
        const cv = await loadOpenCV()
        if (cancelled) return

        const detectDocument = () => {
          if (cancelled) return
          // Re-entrancy guard for OpenCV work only — does not affect capture (separate canvas).
          if (detectBusyRef.current) return

          const video = videoRef.current
          const detectionCanvas = detectionCanvasRef.current
          const overlay = overlayRef.current
          if (!video || !detectionCanvas || !overlay) return
          if (video.readyState < 2) return

          detectBusyRef.current = true
          const busyResetTimer = window.setTimeout(() => {
            if (detectBusyRef.current) detectBusyRef.current = false
          }, 500)

          try {
            const width = 320
            const height = 240

            // Downscale for performance.
            detectionCanvas.width = width
            detectionCanvas.height = height

            const ctx = detectionCanvas.getContext("2d")
            if (!ctx) return
            ctx.drawImage(video, 0, 0, width, height)

            const src = cv.imread(detectionCanvas)
            const gray = new cv.Mat()
            const edges = new cv.Mat()
            const contours = new cv.MatVector()
            const hierarchy = new cv.Mat()

            try {
              cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
              cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
              cv.Canny(gray, edges, 50, 150)

              cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

              const contourCount = contours.size()
              console.log("[LiveScanner] contours found:", contourCount)

              let biggestValid: any | null = null
              let maxArea = 0

              for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i)
                const area = cv.contourArea(cnt)
                if (area > 800) {
                  const peri = cv.arcLength(cnt, true)
                  const approx = new cv.Mat()
                  cv.approxPolyDP(cnt, approx, 0.02 * peri, true)

                  // approx.rows gives the number of points for some builds; keep robust.
                  const rows = approx.rows ?? approx.length
                  if (rows !== 4) {
                    approx.delete()
                    continue
                  }

                  // Contour validation: relaxed for real-world documents.
                  let ordered: ReturnType<typeof orderPoints> | null = null
                  try {
                    ordered = orderPoints(approx)
                  } catch {
                    ordered = null
                  }

                  if (!ordered) {
                    approx.delete()
                    continue
                  }

                  const widthA = Math.hypot(ordered.br.x - ordered.bl.x, ordered.br.y - ordered.bl.y)
                  const widthB = Math.hypot(ordered.tr.x - ordered.tl.x, ordered.tr.y - ordered.tl.y)
                  const maxWidth = Math.max(widthA, widthB)

                  const heightA = Math.hypot(ordered.tr.x - ordered.br.x, ordered.tr.y - ordered.br.y)
                  const heightB = Math.hypot(ordered.tl.x - ordered.bl.x, ordered.tl.y - ordered.bl.y)
                  const maxHeight = Math.max(heightA, heightB)

                  const ratio = maxHeight > 0 ? maxWidth / maxHeight : 0

                  const valid =
                    area > 800 && ratio > 0.3 && ratio < 3

                  if (valid && area > maxArea) {
                    if (biggestValid) biggestValid.delete()
                    biggestValid = approx
                    maxArea = area
                  } else {
                    approx.delete()
                  }
                }
                cnt.delete?.()
              }

              const validThisFrame = Boolean(biggestValid)
              if (validThisFrame) {
                noContourFramesRef.current = 0
                const prevStable = detectionStableRef.current
                detectionStableRef.current = Math.min(prevStable + 2, 10)

                console.log(
                  "[LiveScanner] valid quad contour:",
                  true,
                  "detectionStable:",
                  detectionStableRef.current,
                )

                const orderedNew = orderPoints(biggestValid)
                const orderedOld = smoothedContourRef.current ? orderPoints(smoothedContourRef.current) : null

                // Smoothing: small moves → blend; large moves → snap (no lag).
                const smoothPoint = (oldPt: { x: number; y: number } | null, nextPt: { x: number; y: number }) => {
                  if (!oldPt) return nextPt
                  const dist = Math.hypot(nextPt.x - oldPt.x, nextPt.y - oldPt.y)
                  if (dist < 25) {
                    return { x: oldPt.x * 0.7 + nextPt.x * 0.3, y: oldPt.y * 0.7 + nextPt.y * 0.3 }
                  }
                  return nextPt
                }

                const smooth = {
                  tl: smoothPoint(orderedOld ? orderedOld.tl : null, orderedNew.tl),
                  tr: smoothPoint(orderedOld ? orderedOld.tr : null, orderedNew.tr),
                  br: smoothPoint(orderedOld ? orderedOld.br : null, orderedNew.br),
                  bl: smoothPoint(orderedOld ? orderedOld.bl : null, orderedNew.bl),
                }

                // When already “locked” (stable enough), freeze contour geometry — no per-frame jitter.
                const freezeContour = prevStable >= READY_STABLE_THRESHOLD && detectedContourRef.current

                if (!freezeContour) {
                  // Delete previous contours before replacing (prevent cloned Mats leaks).
                  const oldDetected = detectedContourRef.current
                  const oldSmoothed = smoothedContourRef.current
                  if (oldDetected?.delete) oldDetected.delete()
                  if (oldSmoothed?.delete && oldSmoothed !== oldDetected) oldSmoothed.delete()

                  const nextContour = biggestValid.clone()
                  const d = nextContour.data32S
                  if (d && d.length >= 8) {
                    d[0] = Math.round(smooth.tl.x)
                    d[1] = Math.round(smooth.tl.y)
                    d[2] = Math.round(smooth.tr.x)
                    d[3] = Math.round(smooth.tr.y)
                    d[4] = Math.round(smooth.br.x)
                    d[5] = Math.round(smooth.br.y)
                    d[6] = Math.round(smooth.bl.x)
                    d[7] = Math.round(smooth.bl.y)
                  }

                  detectedContourRef.current = nextContour
                  smoothedContourRef.current = nextContour.clone()
                }

                lastAreaRef.current = maxArea
              } else {
                detectionStableRef.current = Math.max(detectionStableRef.current - 1, 0)

                console.log(
                  "[LiveScanner] valid quad contour:",
                  false,
                  "detectionStable:",
                  detectionStableRef.current,
                )

                // Only drop overlay when stability fully decays (anti-flicker).
                if (detectionStableRef.current === 0) {
                  const oldDetected = detectedContourRef.current
                  const oldSmoothed = smoothedContourRef.current
                  if (oldDetected?.delete) oldDetected.delete()
                  if (oldSmoothed?.delete && oldSmoothed !== oldDetected) oldSmoothed.delete()
                  detectedContourRef.current = null
                  smoothedContourRef.current = null
                  lastAreaRef.current = 0
                }
              }

              // Auto-capture: readiness from stability only; cancel countdown only if stability < 2.
              const isReady = detectionStableRef.current >= READY_STABLE_THRESHOLD
              const shouldCancelAuto = detectionStableRef.current < 2

              if (autoCaptureTimeoutRef.current && shouldCancelAuto) {
                window.clearTimeout(autoCaptureTimeoutRef.current)
                autoCaptureTimeoutRef.current = null
                isCountingDownRef.current = false
              }

              const canAuto =
                isReady &&
                !capturingRef.current &&
                !isAutoCapturingRef.current &&
                pageCountRef.current < 10 &&
                Date.now() >= autoCaptureBlockUntilRef.current &&
                Date.now() - lastCaptureTimeRef.current >= 2000 &&
                !autoCaptureTimeoutRef.current

              if (canAuto) {
                if (autoCaptureTimeoutRef.current) window.clearTimeout(autoCaptureTimeoutRef.current)
                isCountingDownRef.current = true
                autoCaptureTimeoutRef.current = window.setTimeout(() => {
                  autoCaptureTimeoutRef.current = null
                  isCountingDownRef.current = false
                  triggerCapture()
                }, 700)
              }

              // Always redraw overlay (guide is always visible).
              drawOverlay(detectedContourRef.current, overlay, width, height)

              if (biggestValid) biggestValid.delete()
            } finally {
              src.delete()
              gray.delete()
              edges.delete()
              contours.delete()
              hierarchy.delete()
            }
          } finally {
            window.clearTimeout(busyResetTimer)
            detectBusyRef.current = false
          }
        }

        interval = setInterval(() => detectDocument(), 300)
      } catch {
        // If OpenCV fails, keep the scanner functional without overlay.
      }
    }

    startDetection()

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (autoCaptureTimeoutRef.current) {
        window.clearTimeout(autoCaptureTimeoutRef.current)
        autoCaptureTimeoutRef.current = null
        isCountingDownRef.current = false
      }
      if (flashTimeoutRef.current) {
        window.clearTimeout(flashTimeoutRef.current)
        flashTimeoutRef.current = null
      }
      if (showAddedTimeoutRef.current) {
        window.clearTimeout(showAddedTimeoutRef.current)
        showAddedTimeoutRef.current = null
      }
      if (detectedContourRef.current?.delete) {
        detectedContourRef.current.delete()
      }
      if (smoothedContourRef.current?.delete && smoothedContourRef.current !== detectedContourRef.current) {
        smoothedContourRef.current.delete()
      }
      detectedContourRef.current = null
      smoothedContourRef.current = null
    }
  }, [])

  const orderPoints = (pts: any) => {
    const points: Array<{ x: number; y: number }> = []

    for (let i = 0; i < 4; i++) {
      const x = pts.intPtr(i, 0)[0]
      const y = pts.intPtr(i, 0)[1]
      points.push({ x, y })
    }

    const sum = points.map((p) => p.x + p.y)
    const diff = points.map((p) => p.x - p.y)

    return {
      tl: points[sum.indexOf(Math.min(...sum))],
      br: points[sum.indexOf(Math.max(...sum))],
      tr: points[diff.indexOf(Math.min(...diff))],
      bl: points[diff.indexOf(Math.max(...diff))],
    }
  }

  const triggerCapture = () => {
    const now = Date.now()

    // Anti-spam cooldown.
    if (now - lastCaptureTimeRef.current < 2000) return
    if (isAutoCapturingRef.current) return
    if (capturingRef.current) return

    // Re-check trigger conditions (race-safe).
    if (detectionStableRef.current < READY_STABLE_THRESHOLD) return

    isAutoCapturingRef.current = true
    lastCaptureTimeRef.current = now
    autoCaptureBlockUntilRef.current = now + 500
    autoCaptureTimeoutRef.current = null
    isCountingDownRef.current = false

    // Capture flash (brief).
    if (isMountedRef.current) {
      setFlash(true)
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) setFlash(false)
      }, 120)
    }

    handleCapture()

    window.setTimeout(() => {
      if (isMountedRef.current) isAutoCapturingRef.current = false
    }, 1500)
  }

  const handleCapture = async () => {
    // Prevent concurrent captures (manual + auto).
    if (capturingRef.current) return

    // Manual capture cancels any pending auto-capture countdown.
    if (autoCaptureTimeoutRef.current) {
      window.clearTimeout(autoCaptureTimeoutRef.current)
      autoCaptureTimeoutRef.current = null
      isCountingDownRef.current = false
    }

    setCapturePressed(true)
    window.setTimeout(() => {
      if (isMountedRef.current) setCapturePressed(false)
    }, 120)

    capturingRef.current = true
    lastCaptureTimeRef.current = Date.now()

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      capturingRef.current = false
      return
    }

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      capturingRef.current = false
      return
    }

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      capturingRef.current = false
      return
    }

    ctx.drawImage(video, 0, 0, width, height)

    const contour = detectedContourRef.current

    const finishCaptureFromBlob = (blob: Blob | null) => {
      if (!isMountedRef.current) return
      if (blob) {
        onCapture(blob)
        if (isMountedRef.current) setShowAdded(true)
        if (showAddedTimeoutRef.current) window.clearTimeout(showAddedTimeoutRef.current)
        showAddedTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) setShowAdded(false)
        }, 800)
        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            ;(navigator as any).vibrate?.(50)
          }
        } catch {
          // ignore
        }
      }
      capturingRef.current = false
    }

    // Full-frame JPEG without OpenCV — always works even if detection failed or OpenCV is slow.
    if (!contour) {
      canvas.toBlob(
        (blob) => finishCaptureFromBlob(blob),
        "image/jpeg",
        0.9,
      )
      return
    }

    const detectionW = 320
    const detectionH = 240
    const scaleX = width / detectionW
    const scaleY = height / detectionH

    const ordered = orderPoints(contour)

    ordered.tl.x *= scaleX
    ordered.tl.y *= scaleY
    ordered.tr.x *= scaleX
    ordered.tr.y *= scaleY
    ordered.br.x *= scaleX
    ordered.br.y *= scaleY
    ordered.bl.x *= scaleX
    ordered.bl.y *= scaleY

    const widthA = Math.hypot(ordered.br.x - ordered.bl.x, ordered.br.y - ordered.bl.y)
    const widthB = Math.hypot(ordered.tr.x - ordered.tl.x, ordered.tr.y - ordered.tl.y)
    const maxWidth = Math.max(widthA, widthB)

    const heightA = Math.hypot(ordered.tr.x - ordered.br.x, ordered.tr.y - ordered.br.y)
    const heightB = Math.hypot(ordered.tl.x - ordered.bl.x, ordered.tl.y - ordered.bl.y)
    const maxHeight = Math.max(heightA, heightB)

    if (maxWidth < 50 || maxHeight < 50) {
      canvas.toBlob(
        (blob) => finishCaptureFromBlob(blob),
        "image/jpeg",
        0.9,
      )
      return
    }

    const cv = await loadOpenCV()
    const src = cv.imread(canvas)

    let dst: any | null = null
    let M: any | null = null
    let srcTri: any | null = null
    let dstTri: any | null = null

    try {
      const outW = Math.max(2, Math.round(maxWidth))
      const outH = Math.max(2, Math.round(maxHeight))

      dst = cv.Mat.zeros(outH, outW, cv.CV_8UC3)

      srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        ordered.tl.x,
        ordered.tl.y,
        ordered.tr.x,
        ordered.tr.y,
        ordered.br.x,
        ordered.br.y,
        ordered.bl.x,
        ordered.bl.y,
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
      cv.warpPerspective(src, dst, M, new cv.Size(outW, outH))

      const resultCanvas = document.createElement("canvas")
      cv.imshow(resultCanvas, dst)

      resultCanvas.toBlob(
        (blob) => finishCaptureFromBlob(blob),
        "image/jpeg",
        0.95,
      )
    } catch {
      canvas.toBlob(
        (blob) => finishCaptureFromBlob(blob),
        "image/jpeg",
        0.9,
      )
    } finally {
      src.delete()
      if (srcTri) srcTri.delete()
      if (dstTri) dstTri.delete()
      if (M) M.delete()
      if (dst) dst.delete()
    }
  }

  const handleCancel = () => {
    // Prevent any pending async callbacks from mutating state / adding pages after cancel.
    isMountedRef.current = false

    if (autoCaptureTimeoutRef.current) {
      window.clearTimeout(autoCaptureTimeoutRef.current)
      autoCaptureTimeoutRef.current = null
    }
    isAutoCapturingRef.current = false
    capturingRef.current = false
    isCountingDownRef.current = false

    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
    if (showAddedTimeoutRef.current) {
      window.clearTimeout(showAddedTimeoutRef.current)
      showAddedTimeoutRef.current = null
    }

    onCancel()
  }

  const handleFinalize = () => {
    // Prevent any pending async callbacks from mutating state / adding pages after finalizing.
    isMountedRef.current = false

    if (autoCaptureTimeoutRef.current) {
      window.clearTimeout(autoCaptureTimeoutRef.current)
      autoCaptureTimeoutRef.current = null
    }
    isAutoCapturingRef.current = false
    capturingRef.current = false
    isCountingDownRef.current = false

    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
    if (showAddedTimeoutRef.current) {
      window.clearTimeout(showAddedTimeoutRef.current)
      showAddedTimeoutRef.current = null
    }

    onFinish()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 transition-opacity duration-200 ease-out flex flex-col">
      <div className="relative flex-1 min-h-0 min-w-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <canvas
          ref={overlayRef}
          className="absolute inset-0 z-[1] w-full h-full pointer-events-none"
        />

        <div
          className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-[120ms] ease-out ${
            flash ? "opacity-25" : "opacity-0"
          }`}
        />

        <div className="absolute top-0 inset-x-0 z-[2] px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2 flex items-center justify-between pointer-events-none">
          <p className="text-xs text-white/80">Escaneando...</p>
          <p className="text-xs text-white/80">
            {pageCount} {pageCount === 1 ? "página" : "páginas"}
          </p>
        </div>

        {error && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center px-4 pointer-events-none">
            <p className="text-sm text-white">{error}</p>
          </div>
        )}
      </div>

      <div className="relative z-30 p-4 shrink-0 pointer-events-auto bg-black/90 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/90">
            {pageCount} páginas escaneadas
          </p>

          <div className="h-4 flex items-center">
            <p
              className={`text-xs font-semibold text-[#00FFAA] transition-opacity duration-300 ${
                showAdded ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!showAdded}
            >
              Página añadida
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-white relative z-10 pointer-events-auto"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleCapture}
            className={`relative z-10 pointer-events-auto w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-transform duration-[120ms] ease-out ${
              capturePressed ? "scale-[0.94]" : "scale-100"
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-black/70 pointer-events-none" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleFinalize}
            className="text-white relative z-10 pointer-events-auto"
          >
            Finalizar
          </Button>
        </div>

        {/* Full-res capture canvas — never used by OpenCV detection */}
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        {/* Downscaled detection canvas — isolated from capture to avoid races */}
        <canvas ref={detectionCanvasRef} className="hidden" aria-hidden />
      </div>
    </div>
  )
}

