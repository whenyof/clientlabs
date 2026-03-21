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
  const CAMERA_TEST_MODE = false
  const videoRef = useRef<HTMLVideoElement | null>(null)
  /** Full-resolution frame for manual/auto capture only (never shared with detection). */
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [cvError, setCvError] = useState<string | null>(null)
  /** Increment to re-run camera `getUserMedia` (user retry). */
  const [cameraRetryTick, setCameraRetryTick] = useState(0)
  const [flash, setFlash] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const [capturePressed, setCapturePressed] = useState(false)
  const capturingRef = useRef(false)
  const detectBusyRef = useRef(false)
  const openCvPromiseRef = useRef<Promise<any> | null>(null)
  /** OpenCV runtime when ready; detection skips until set (camera/capture work without it). */
  const cvRef = useRef<any>(null)
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
    isMountedRef.current = true
    console.log("Scanner mounted")
    return () => {
      console.log("Scanner unmounted")
      isMountedRef.current = false
      isAutoCapturingRef.current = false
      capturingRef.current = false
      isCountingDownRef.current = false
    }
  }, [])

  const loadOpenCV = () =>
    (openCvPromiseRef.current ??= new Promise((resolve, reject) => {
      const w = window as any
      if (w.cv) return resolve(w.cv)

      const script = document.createElement("script")
      script.src = "https://docs.opencv.org/4.x/opencv.js"
      script.async = true

      script.onload = () => {
        // opencv.js sets `cv` and `cv.onRuntimeInitialized` is called once ready.
        w.cv = w.cv ?? w.cv
        if (!w.cv) {
          reject(new Error("OpenCV failed"))
          return
        }
        // If runtime is already initialized, resolve immediately.
        if (w.cv.getBuildInformation) {
          resolve(w.cv)
          return
        }
        w.cv.onRuntimeInitialized = () => resolve(w.cv)
      }

      script.onerror = () => {
        if (isMountedRef.current) setCvError("OpenCV failed to load")
        reject(new Error("OpenCV failed"))
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

    /**
     * Attach stream to `<video>` once the ref exists (fixes race: getUserMedia before first paint).
     * Does not call getUserMedia again.
     */
    const attachStreamToVideo = (stream: MediaStream, videoWaitAttempts = 0) => {
      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      const video = videoRef.current
      if (!video) {
        if (videoWaitAttempts > 180) {
          console.error("Camera: videoRef never became available")
          stream.getTracks().forEach((t) => t.stop())
          if (mounted) setError("No se pudo iniciar la cámara")
          return
        }
        requestAnimationFrame(() => attachStreamToVideo(stream, videoWaitAttempts + 1))
        return
      }

      streamRef.current = stream
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.autoplay = true

      void (async () => {
        try {
          await video.play()
          console.log("Video playing")
          console.log("Video state:", video.readyState, video.videoWidth, video.videoHeight)
        } catch (err) {
          console.warn("video.play failed, retrying...", err)
          setTimeout(() => {
            video.play().catch(() => {})
          }, 300)
        }
      })()
    }

    const start = async () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks()
        const active = tracks.some((t) => t.readyState === "live")
        if (active) {
          console.log("Camera: stream already active — skip init")
          return
        }
      }

      setError(null)
      console.log("Requesting camera access...", { retryTick: cameraRetryTick })

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
          console.log("Camera: unmounted before stream attach — stopping tracks")
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        console.log("Camera stream acquired")
        console.log("Tracks:", stream.getTracks())
        console.log("Video track settings:", stream.getVideoTracks()[0]?.getSettings())
        attachStreamToVideo(stream)
      } catch (err) {
        console.error("Camera error:", err)
        const isDenied =
          err instanceof DOMException &&
          (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
        setError(
          isDenied
            ? "Permiso de cámara denegado"
            : "No se pudo iniciar la cámara",
        )
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
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [cameraRetryTick])

  useEffect(() => {
    if (cvError) {
      console.warn(cvError)
    }
  }, [cvError])

  const retryCamera = () => {
    console.log("Reintentar cámara — user action")
    setError(null)
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
    }
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraRetryTick((n) => n + 1)
  }

  useEffect(() => {
    if (CAMERA_TEST_MODE) {
      console.log("Camera test mode: detection loop disabled")
      return
    }
    let interval: any
    let cancelled = false

    // Load OpenCV in background — never blocks the detection interval or camera.
    loadOpenCV()
      .then((cv) => {
        if (cancelled) return
        cvRef.current = cv
      })
      .catch((err) => {
        console.error("OpenCV / detection init failed (background):", err)
        // cvRef stays null: manual capture and camera still work.
      })

    // Isolated offscreen canvas for detection only (never touches camera/capture canvases).
    const detectionCanvas = document.createElement("canvas")

    const detectDocument = () => {
      if (cancelled) return

      const video = videoRef.current
      const overlay = overlayRef.current
      if (!video || !overlay) return
      if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
        return
      }

      const cv = cvRef.current
      if (!cv) {
        // OpenCV not ready yet — keep loop alive, show guide only.
        drawOverlay(null, overlay, 320, 240)
        return
      }

      // Re-entrancy guard for OpenCV work only — does not affect capture (separate canvas).
      if (detectBusyRef.current) {
        console.log("Detection skip: busy (previous OpenCV pass still running)")
        return
      }

      detectBusyRef.current = true
      const busyResetTimer = window.setTimeout(() => {
        if (detectBusyRef.current) detectBusyRef.current = false
      }, 500)

      try {
        // Downscale frame for fast detection.
        const width = 320
        const height = 240
        detectionCanvas.width = width
        detectionCanvas.height = height

        const ctx = detectionCanvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(video, 0, 0, width, height)

        // Keep all OpenCV work isolated and fail-safe.
        try {
          const src = cv.imread(detectionCanvas)
          const gray = new cv.Mat()
          const thresh = new cv.Mat()
          const edges = new cv.Mat()
          const contours = new cv.MatVector()
          const hierarchy = new cv.Mat()

          try {
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
            cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
            cv.adaptiveThreshold(
              gray,
              thresh,
              255,
              cv.ADAPTIVE_THRESH_GAUSSIAN_C,
              cv.THRESH_BINARY,
              11,
              2,
            )
            cv.Canny(thresh, edges, 50, 150)
            cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

            let biggestValid: any | null = null
            let maxArea = 0
            const contourOrder: Array<{ idx: number; area: number }> = []

            for (let i = 0; i < contours.size(); i++) {
              const cnt = contours.get(i)
              const area = cv.contourArea(cnt)
              contourOrder.push({ idx: i, area })
              cnt.delete?.()
            }
            contourOrder.sort((a, b) => b.area - a.area)

            for (const { idx, area } of contourOrder) {
              if (area <= 2000) continue
              const cnt = contours.get(idx)
              const peri = cv.arcLength(cnt, true)
              const approx = new cv.Mat()
              cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
              const rows = approx.rows ?? approx.length

              if (rows === 4 && area > maxArea) {
                if (biggestValid) biggestValid.delete()
                biggestValid = approx
                maxArea = area
              } else {
                approx.delete()
              }
              cnt.delete?.()
            }

            if (biggestValid) {
              const oldDetected = detectedContourRef.current
              const oldSmoothed = smoothedContourRef.current
              if (oldDetected?.delete) oldDetected.delete()
              if (oldSmoothed?.delete && oldSmoothed !== oldDetected) oldSmoothed.delete()

              detectedContourRef.current = biggestValid.clone()
              smoothedContourRef.current = detectedContourRef.current.clone()
              detectionStableRef.current = Math.min(detectionStableRef.current + 2, 10)
              lastAreaRef.current = maxArea
              biggestValid.delete()
            } else {
              detectionStableRef.current = Math.max(detectionStableRef.current - 1, 0)
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
          } finally {
            src.delete()
            gray.delete()
            thresh.delete()
            edges.delete()
            contours.delete()
            hierarchy.delete()
          }
        } catch (detectErr) {
          // Fail-safe: detection failures never affect camera lifecycle/UI.
          console.warn("Detection frame failed:", detectErr)
        }

        // Overlay only: draw current contour/guide; no camera state changes.
        drawOverlay(detectedContourRef.current, overlay, width, height)
    } finally {
      window.clearTimeout(busyResetTimer)
      detectBusyRef.current = false
    }
    }

    interval = setInterval(() => detectDocument(), 300)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
      cvRef.current = null
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
    if (CAMERA_TEST_MODE) {
      const video = videoRef.current
      console.log("Capture button clicked (camera test mode)")
      if (!video) {
        console.log("Video not ready yet")
        return
      }
      console.log("Video state:", video.readyState, video.videoWidth, video.videoHeight)
      if (video.readyState < 2) {
        console.log("Video not ready yet")
        return
      }
      return
    }
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
    <div className="fixed inset-0 z-50 flex flex-col bg-black transition-opacity duration-200 ease-out">
      <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover bg-black pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            console.log("Video ready:", v.readyState, v.videoWidth, v.videoHeight)
          }}
          onPlaying={() => {
            const v = videoRef.current
            if (v) console.log("Video playing (event), dimensions:", v.videoWidth, v.videoHeight)
          }}
        />

        <canvas
          ref={overlayRef}
          className="absolute inset-0 h-full w-full"
          style={{ zIndex: 2, pointerEvents: "none" }}
        />

        <div
          className={`pointer-events-none absolute inset-0 z-[3] bg-white transition-opacity duration-[120ms] ease-out ${
            flash ? "opacity-25" : "opacity-0"
          }`}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),12px)]">
          <p className="text-xs text-white/80">Escaneando...</p>
          <p className="text-xs text-white/80">
            {pageCount} {pageCount === 1 ? "página" : "páginas"}
          </p>
        </div>

        {error && (
          <div className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/55 px-4">
            <div className="w-full max-w-sm rounded-lg border border-white/15 bg-black/80 p-4 text-center shadow-lg space-y-3">
              <p className="text-sm text-white">{error}</p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={retryCamera}
              >
                Reintentar cámara
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-auto relative z-50 shrink-0 border-t border-white/10 bg-black/90 p-4">
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
      </div>
    </div>
  )
}

