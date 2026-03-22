/* Mobile scan session page V1: captura páginas, genera PDF y completa la sesión */
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PDFDocument, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LiveScanner } from "@/components/scanner/LiveScanner"
import { EdgeEditor, CornerPoint } from "@/components/scanner/EdgeEditor"

type ScanSessionStatus = "PENDING" | "UPLOADED" | "COMPLETED" | "EXPIRED"

type ScanSessionInfo = {
  status: ScanSessionStatus
  documentName: string
  category: string
  fileUrl: string | null
  expiresAt: string
}

type PageFile = {
  id: string
  file: File
  previewUrl: string
  processedPreviewUrl?: string
  processedMode?: "color" | "bw" | "contrast"
  processing?: boolean
  corners?: [CornerPoint, CornerPoint, CornerPoint, CornerPoint]
  isWarped?: boolean
}

async function processImage(
  file: File,
  mode: "color" | "bw" | "contrast",
  options?: { skipGeometry?: boolean },
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file)
  const skipGeometry = options?.skipGeometry === true

  try {
    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("No se pudo cargar la imagen capturada"))
      img.src = imageUrl
    })

    const width = imgEl.naturalWidth || imgEl.width
    const height = imgEl.naturalHeight || imgEl.height

    if (!width || !height) {
      throw new Error("Dimensiones de imagen inválidas")
    }

    // Downscale defensivo para mantener rendimiento estable en móvil.
    const maxProcessingDim = 1800
    const scale = Math.min(1, maxProcessingDim / Math.max(width, height))
    const scaledWidth = Math.max(1, Math.round(width * scale))
    const scaledHeight = Math.max(1, Math.round(height * scale))

    const sourceCanvas = document.createElement("canvas")
    sourceCanvas.width = scaledWidth
    sourceCanvas.height = scaledHeight
    const sourceCtx = sourceCanvas.getContext("2d")
    if (!sourceCtx) throw new Error("No se pudo crear el contexto de canvas")
    sourceCtx.drawImage(imgEl, 0, 0, scaledWidth, scaledHeight)

    // Grises + contraste básico para preparar detección simple de bordes.
    const imageData = sourceCtx.getImageData(0, 0, scaledWidth, scaledHeight)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      // Contraste básico para reforzar separación documento/fondo.
      const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.1 + 128))
      data[i] = contrasted
      data[i + 1] = contrasted
      data[i + 2] = contrasted
    }
    sourceCtx.putImageData(imageData, 0, 0)

    // Geometry pipeline: si la imagen ya fue editada/rectificada,
    // evitamos autocrop/perspective para no aplicar doble transformación.
    let warpedCanvas: HTMLCanvasElement = sourceCanvas
    let warpedCtx: CanvasRenderingContext2D = sourceCtx
    let targetWidth = scaledWidth
    let targetHeight = scaledHeight

    if (!skipGeometry) {
      // Autocrop V1: se asume documento centrado y se recortan bordes exteriores.
      const margin = 0.05
      const cropX = Math.floor(scaledWidth * margin)
      const cropY = Math.floor(scaledHeight * margin)
      const cropWidth = Math.max(1, Math.floor(scaledWidth * (1 - margin * 2)))
      const cropHeight = Math.max(1, Math.floor(scaledHeight * (1 - margin * 2)))

      const croppedCanvas = document.createElement("canvas")
      croppedCanvas.width = cropWidth
      croppedCanvas.height = cropHeight
      const croppedCtx = croppedCanvas.getContext("2d")
      if (!croppedCtx) throw new Error("No se pudo crear el contexto del recorte")

      croppedCtx.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      )

      // V2: Corrección de perspectiva simulada (quad -> plano).
      // Sin OpenCV: estimamos esquinas probables y aplanamos por remapeo por filas.
      const quadPadding = 0.03
      const quadWidth = croppedCanvas.width
      const quadHeight = croppedCanvas.height

      const topLeft = { x: quadWidth * quadPadding, y: quadHeight * quadPadding }
      const topRight = { x: quadWidth * (1 - quadPadding), y: quadHeight * quadPadding }
      const bottomLeft = { x: quadWidth * quadPadding, y: quadHeight * (1 - quadPadding) }
      const bottomRight = { x: quadWidth * (1 - quadPadding), y: quadHeight * (1 - quadPadding) }

      const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
        Math.hypot(b.x - a.x, b.y - a.y)
      const topW = distance(topLeft, topRight)
      const bottomW = distance(bottomLeft, bottomRight)
      const leftH = distance(topLeft, bottomLeft)
      const rightH = distance(topRight, bottomRight)

      targetWidth = Math.max(600, Math.round((topW + bottomW) / 2))
      // A4-like ratio (h/w ~ 1.414) limitado por geometría detectada.
      const rawTargetHeight = Math.max(Math.round((leftH + rightH) / 2), Math.round(targetWidth * 1.2))
      const a4TargetHeight = Math.round(targetWidth * Math.SQRT2)
      targetHeight = Math.max(700, Math.round((rawTargetHeight + a4TargetHeight) / 2))

      warpedCanvas = document.createElement("canvas")
      warpedCanvas.width = targetWidth
      warpedCanvas.height = targetHeight
      const perspectiveCtx = warpedCanvas.getContext("2d")
      if (!perspectiveCtx) throw new Error("No se pudo crear el contexto de perspectiva")
      warpedCtx = perspectiveCtx

      const srcCtx = croppedCanvas.getContext("2d")
      if (!srcCtx) throw new Error("No se pudo leer el canvas recortado")
      const srcImage = srcCtx.getImageData(0, 0, quadWidth, quadHeight)
      const srcPixels = srcImage.data

      const dstImage = warpedCtx.createImageData(targetWidth, targetHeight)
      const dstPixels = dstImage.data

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const lerpPoint = (
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        t: number,
      ) => ({ x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) })

      // Warp básico por interpolación bilineal del cuadrilátero.
      for (let y = 0; y < targetHeight; y += 1) {
        const ty = targetHeight > 1 ? y / (targetHeight - 1) : 0
        const left = lerpPoint(topLeft, bottomLeft, ty)
        const right = lerpPoint(topRight, bottomRight, ty)

        for (let x = 0; x < targetWidth; x += 1) {
          const tx = targetWidth > 1 ? x / (targetWidth - 1) : 0
          const srcPoint = lerpPoint(left, right, tx)

          const srcX = Math.max(0, Math.min(quadWidth - 1, Math.round(srcPoint.x)))
          const srcY = Math.max(0, Math.min(quadHeight - 1, Math.round(srcPoint.y)))

          const srcIndex = (srcY * quadWidth + srcX) * 4
          const dstIndex = (y * targetWidth + x) * 4
          dstPixels[dstIndex] = srcPixels[srcIndex]
          dstPixels[dstIndex + 1] = srcPixels[srcIndex + 1]
          dstPixels[dstIndex + 2] = srcPixels[srcIndex + 2]
          dstPixels[dstIndex + 3] = srcPixels[srcIndex + 3]
        }
      }

      warpedCtx.putImageData(dstImage, 0, 0)
    }

    // V3: realce documental configurable por modo de filtro.
    // "color": solo autocrop + perspectiva (sin threshold).
    // "bw": threshold estándar; "contrast": threshold agresivo.
    if (mode !== "color") {
      const finalImageData = warpedCtx.getImageData(0, 0, targetWidth, targetHeight)
      const finalPixels = finalImageData.data

      // 1) Media de luminancia global para adaptar contraste/threshold a cada captura.
      let sum = 0
      let count = 0
      for (let i = 0; i < finalPixels.length; i += 4) {
        const r = finalPixels[i]
        const g = finalPixels[i + 1]
        const b = finalPixels[i + 2]
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        sum += gray
        count += 1
      }
      const avg = count > 0 ? sum / count : 128

      // 2) Threshold adaptativo según exposición media (acotado para estabilidad).
      const baseThreshold = avg * (mode === "contrast" ? 0.95 : 0.9)
      const threshold = Math.max(95, Math.min(190, baseThreshold))

      // 3) Mapa de iluminación local (bloques) para compensar sombras/zonas oscuras.
      const blockSize = 16
      const mapWidth = targetWidth
      const mapHeight = targetHeight
      const illumMap = new Float32Array(mapWidth * mapHeight)

      for (let y = 0; y < mapHeight; y += blockSize) {
        for (let x = 0; x < mapWidth; x += blockSize) {
          let localSum = 0
          let localCount = 0

          for (let by = 0; by < blockSize; by += 1) {
            for (let bx = 0; bx < blockSize; bx += 1) {
              const px = x + bx
              const py = y + by
              if (px >= mapWidth || py >= mapHeight) continue

              const idx = (py * mapWidth + px) * 4
              const r = finalPixels[idx]
              const g = finalPixels[idx + 1]
              const b = finalPixels[idx + 2]
              const gray = 0.299 * r + 0.587 * g + 0.114 * b
              localSum += gray
              localCount += 1
            }
          }

          const localAvg = localCount > 0 ? localSum / localCount : avg

          for (let by = 0; by < blockSize; by += 1) {
            for (let bx = 0; bx < blockSize; bx += 1) {
              const px = x + bx
              const py = y + by
              if (px >= mapWidth || py >= mapHeight) continue
              illumMap[py * mapWidth + px] = localAvg
            }
          }
        }
      }

      // 3) Contraste inteligente según nivel de iluminación de la imagen.
      const factor = avg < 120 ? 1.7 : 1.4
      const softness = mode === "contrast" ? 0.25 : 0.35

      for (let i = 0; i < finalPixels.length; i += 4) {
        const r = finalPixels[i]
        const g = finalPixels[i + 1]
        const b = finalPixels[i + 2]
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        const pixelIndex = i >> 2
        const local = illumMap[pixelIndex] ?? avg
        const normalized = gray - (local - avg)
        const contrasted = (normalized - avg) * factor + avg
        let clean: number
        if (contrasted > threshold) {
          clean = 255
        } else {
          // Conserva detalles suaves (firmas/sellos/sombras leves) como gris controlado.
          clean = contrasted * softness
        }
        clean = Math.max(0, Math.min(255, clean))
        finalPixels[i] = clean
        finalPixels[i + 1] = clean
        finalPixels[i + 2] = clean
      }
      warpedCtx.putImageData(finalImageData, 0, 0)
    }

    return await new Promise<Blob>((resolve, reject) => {
      warpedCanvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("No se pudo exportar la imagen corregida en perspectiva")),
        "image/jpeg",
        0.9,
      )
    })
  } catch {
    // Fallback robusto: si el modo skipGeometry falla, reintentamos con geometría completa.
    if (skipGeometry) {
      try {
        return await processImage(file, mode, { skipGeometry: false })
      } catch {
        // fall through to robust fallback
      }
    }

    // Fallback robusto: usar imagen completa (sin recorte), manteniendo exportación JPEG.
    try {
      const fallbackUrl = URL.createObjectURL(file)
      try {
        const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error("No se pudo cargar la imagen de fallback"))
          img.src = fallbackUrl
        })
        const fallbackCanvas = document.createElement("canvas")
        fallbackCanvas.width = imgEl.naturalWidth || imgEl.width
        fallbackCanvas.height = imgEl.naturalHeight || imgEl.height
        const fallbackCtx = fallbackCanvas.getContext("2d")
        if (!fallbackCtx) throw new Error("No se pudo crear el contexto de fallback")
        fallbackCtx.drawImage(imgEl, 0, 0)
        return await new Promise<Blob>((resolve, reject) => {
          fallbackCanvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo exportar fallback JPEG"))),
            "image/jpeg",
            0.85,
          )
        })
      } finally {
        URL.revokeObjectURL(fallbackUrl)
      }
    } catch {
      return file
    }
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export function ScanSessionPageInner({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const publicToken = searchParams.get("token")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState<"processing" | "pdf" | "upload" | null>(null)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [isSuccessLocked, setIsSuccessLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<ScanSessionInfo | null>(null)
  const [pages, setPages] = useState<PageFile[]>([])
  const [selectedPage, setSelectedPage] = useState<PageFile | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [editingPage, setEditingPage] = useState<PageFile | null>(null)
  const [newlyAddedPageIds, setNewlyAddedPageIds] = useState<Set<string>>(new Set())
  const pagesRef = useRef<PageFile[]>([])
  const previewGenerationRef = useRef(0)
  const successTimeoutRef = useRef<any>(null)
  const newPageAnimationTimeoutsRef = useRef<number[]>([])
  const isMountedRef = useRef(true)
  const isSuccessRef = useRef(false)

  useEffect(() => {
    if (!sessionId) return

    let active = true
    // Reset local view state whenever session changes to avoid stale UI.
    if (active && isMountedRef.current) {
      setSession(null)
      setError(null)
      setReviewMode(false)
      setLoading(true)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const loadSession = async () => {
      // Unified guard + loading/error handling to avoid split state transitions.
      if (!publicToken || typeof publicToken !== "string" || publicToken.length < 10) {
        if (active && isMountedRef.current) {
          setError("Token inválido.")
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch(
          `/api/scan-sessions/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(publicToken)}`,
          { signal: controller.signal },
        )

        if (!res.ok) {
          if (active && isMountedRef.current) setError("Error cargando sesión")
          return
        }

        const data = await res.json().catch(() => null)

        if (!data || !data.status) {
          if (active && isMountedRef.current) setError("Sesión no encontrada")
          return
        }

        if (data.status === "EXPIRED") {
          if (active && isMountedRef.current) setError("Sesión expirada")
          return
        }

        if (active && isMountedRef.current) setSession(data as ScanSessionInfo)
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          if (active && isMountedRef.current) setError("La conexión ha tardado demasiado.")
          return
        }
        if (active && isMountedRef.current) setError("Error de red")
      } finally {
        clearTimeout(timeout)
        if (active && isMountedRef.current && !controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      active = false
      controller.abort()
    }
  }, [sessionId, publicToken])

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current)
      if (newPageAnimationTimeoutsRef.current.length > 0) {
        newPageAnimationTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
        newPageAnimationTimeoutsRef.current = []
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const addPageFiles = (files: File[]) => {
    if (!files.length) return

    const next: PageFile[] = []
    for (const f of files) {
      next.push({
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        processing: true,
      })
    }

    const nextIds = next.map((p) => p.id)
    if (nextIds.length > 0) {
      setNewlyAddedPageIds((prev) => {
        const updated = new Set(prev)
        nextIds.forEach((id) => updated.add(id))
        return updated
      })

      nextIds.forEach((id) => {
        const timeoutId = window.setTimeout(() => {
          if (!isMountedRef.current) return
          setNewlyAddedPageIds((prev) => {
            if (!prev.has(id)) return prev
            const updated = new Set(prev)
            updated.delete(id)
            return updated
          })
        }, 220)
        newPageAnimationTimeoutsRef.current.push(timeoutId)
      })
    }

    setPages((prev) => {
      const combined = [...prev, ...next]
      const kept = combined.slice(0, 10)
      // If we exceed the max page limit, revoke object URLs that won't be kept.
      if (combined.length > 10) {
        for (let i = 10; i < combined.length; i++) {
          const dropped = combined[i]
          URL.revokeObjectURL(dropped.previewUrl)
          if (dropped.processedPreviewUrl) URL.revokeObjectURL(dropped.processedPreviewUrl)
        }
      }
      return kept
    })
  }

  const handleCapture = (blob: Blob) => {
    if (pagesRef.current.length >= 10) return
    const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" })
    addPageFiles([file])
  }

  const handleRemovePage = (index: number) => {
    const removingPageId = pagesRef.current[index]?.id
    setPages((prev) => {
      const copy = [...prev]
      const removed = copy.splice(index, 1)
      removed.forEach((p) => {
        URL.revokeObjectURL(p.previewUrl)
        if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
      })
      return copy
    })
    if (removingPageId && editingPage?.id === removingPageId) setEditingPage(null)
  }

  const handleDeleteAll = () => {
    if (pagesRef.current.length === 0) return
    // Simple guard to prevent accidental deletion.
    const ok = typeof window !== "undefined" ? window.confirm("¿Eliminar todas las páginas?") : false
    if (!ok) return

    pagesRef.current.forEach((p) => {
      URL.revokeObjectURL(p.previewUrl)
      if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
    })

    setSelectedPage(null)
    setDragIndex(null)
    setPages([])
    setNewlyAddedPageIds(new Set())
    setEditingPage(null)
    setReviewMode(false)
    setError(null)
  }

  const warpQuadToJpegBlob = async (
    imageUrl: string,
    corners: [CornerPoint, CornerPoint, CornerPoint, CornerPoint],
    opts?: { maxInputDim?: number; maxOutputDim?: number },
  ): Promise<Blob> => {
    const { maxInputDim = 1400, maxOutputDim = 1400 } = opts ?? {}

    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para editar"))
      img.src = imageUrl
    })

    const inputW = imgEl.naturalWidth
    const inputH = imgEl.naturalHeight
    if (!inputW || !inputH) throw new Error("Dimensiones de imagen inválidas")

    const scaleIn = Math.min(1, maxInputDim / Math.max(inputW, inputH))
    const quadW = Math.max(1, Math.round(inputW * scaleIn))
    const quadH = Math.max(1, Math.round(inputH * scaleIn))

    const inputCanvas = document.createElement("canvas")
    inputCanvas.width = quadW
    inputCanvas.height = quadH
    const inputCtx = inputCanvas.getContext("2d")
    if (!inputCtx) throw new Error("No se pudo crear el canvas de entrada")
    inputCtx.drawImage(imgEl, 0, 0, quadW, quadH)

    const srcImageData = inputCtx.getImageData(0, 0, quadW, quadH)
    const srcPixels = srcImageData.data

    const scalePoint = (p: CornerPoint): CornerPoint => ({ x: p.x * scaleIn, y: p.y * scaleIn })
    const [tl, tr, br, bl] = corners.map(scalePoint) as [CornerPoint, CornerPoint, CornerPoint, CornerPoint]

    const distance = (a: CornerPoint, b: CornerPoint) => Math.hypot(a.x - b.x, a.y - b.y)

    const widthA = distance(br, bl)
    const widthB = distance(tr, tl)
    const outW0 = Math.max(1, Math.round(Math.max(widthA, widthB)))

    const heightA = distance(tr, br)
    const heightB = distance(tl, bl)
    const outH0 = Math.max(1, Math.round(Math.max(heightA, heightB)))

    const outScale = Math.min(1, maxOutputDim / Math.max(outW0, outH0))
    const outW = Math.max(2, Math.round(outW0 * outScale))
    const outH = Math.max(2, Math.round(outH0 * outScale))

    const outCanvas = document.createElement("canvas")
    outCanvas.width = outW
    outCanvas.height = outH
    const outCtx = outCanvas.getContext("2d")
    if (!outCtx) throw new Error("No se pudo crear el canvas de salida")

    const dstImageData = outCtx.createImageData(outW, outH)
    const dstPixels = dstImageData.data

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const lerpPoint = (p1: CornerPoint, p2: CornerPoint, t: number): CornerPoint => ({
      x: lerp(p1.x, p2.x, t),
      y: lerp(p1.y, p2.y, t),
    })

    // Warp ligero (bilinear quad -> rect) para mantenerlo estable sin librerías.
    for (let y = 0; y < outH; y++) {
      const ty = outH > 1 ? y / (outH - 1) : 0
      const left = lerpPoint(tl, bl, ty)
      const right = lerpPoint(tr, br, ty)

      for (let x = 0; x < outW; x++) {
        const tx = outW > 1 ? x / (outW - 1) : 0
        const srcPoint = lerpPoint(left, right, tx)

        const srcX = Math.max(0, Math.min(quadW - 1, Math.round(srcPoint.x)))
        const srcY = Math.max(0, Math.min(quadH - 1, Math.round(srcPoint.y)))
        const srcIdx = (srcY * quadW + srcX) * 4

        const dstIdx = (y * outW + x) * 4
        dstPixels[dstIdx] = srcPixels[srcIdx]
        dstPixels[dstIdx + 1] = srcPixels[srcIdx + 1]
        dstPixels[dstIdx + 2] = srcPixels[srcIdx + 2]
        dstPixels[dstIdx + 3] = 255
      }
    }

    outCtx.putImageData(dstImageData, 0, 0)

    return await new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo exportar el JPEG editado"))), "image/jpeg", 0.9)
    })
  }

  const handleApplyCorners = async (newCorners: [CornerPoint, CornerPoint, CornerPoint, CornerPoint]) => {
    if (!editingPage) return
    const pageId = editingPage.id

    const sourceImageUrl = editingPage.processedPreviewUrl || editingPage.previewUrl
    const oldPreviewUrl = editingPage.previewUrl
    const oldProcessedUrl = editingPage.processedPreviewUrl

    setEditingPage(null)

    // Marca processing para feedback UX (solo esta página).
    setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, processing: true } : p)))
    setError(null)

    let nextPreviewUrl: string | null = null
    let nextProcessedUrl: string | null = null

    try {
      const warpedBlob = await warpQuadToJpegBlob(sourceImageUrl, newCorners)
      const warpedFile = new File([warpedBlob], `scan-${Date.now()}-edited.jpg`, { type: "image/jpeg" })
      nextPreviewUrl = URL.createObjectURL(warpedBlob)

      const processedBlob = await processImage(warpedFile, "bw", { skipGeometry: true })
      nextProcessedUrl = URL.createObjectURL(processedBlob)

      if (!nextPreviewUrl || !nextProcessedUrl) {
        throw new Error("No se pudo preparar la previsualización editada.")
      }

      const safePreviewUrl = nextPreviewUrl
      const safeProcessedUrl = nextProcessedUrl

      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== pageId) return p
          return {
            ...p,
            file: warpedFile,
            previewUrl: safePreviewUrl,
            processedPreviewUrl: safeProcessedUrl,
            processedMode: "bw",
            processing: false,
            corners: newCorners,
            isWarped: true,
          }
        }),
      )

      // Cleanup: revoca URLs anteriores tras actualizar.
      setTimeout(() => {
        URL.revokeObjectURL(oldPreviewUrl)
        if (oldProcessedUrl) URL.revokeObjectURL(oldProcessedUrl)
      }, 0)
    } catch (err: any) {
      setError(err?.message || "Error al aplicar la corrección de bordes.")
      setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, processing: false } : p)))
      if (nextPreviewUrl) URL.revokeObjectURL(nextPreviewUrl)
      if (nextProcessedUrl) URL.revokeObjectURL(nextProcessedUrl)
    }
  }

  useEffect(() => {
    pagesRef.current = pages
  }, [pages])

  useEffect(() => {
    // cleanup previews on unmount
    return () => {
      pagesRef.current.forEach((p) => {
        URL.revokeObjectURL(p.previewUrl)
        if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
      })
    }
  }, [])

  useEffect(() => {
    if (selectedPage || scannerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedPage, scannerOpen])

  useEffect(() => {
    if (pagesRef.current.length === 0) return

    const generation = ++previewGenerationRef.current
    let cancelled = false

    // marca estado de procesamiento para feedback UX
    setPages((prev) => prev.map((p) => ({ ...p, processing: true })))

    ;(async () => {
      for (const page of pagesRef.current) {
        if (cancelled || generation !== previewGenerationRef.current) return
        if (page.processedPreviewUrl && page.processedMode === "bw" && !page.processing) {
          continue
        }
        try {
          const processedBlob = await processImage(page.file, "bw", { skipGeometry: page.isWarped === true })
          if (cancelled || generation !== previewGenerationRef.current) return
          const nextUrl = URL.createObjectURL(processedBlob)
          setPages((prev) =>
            prev.map((p) => {
              if (p.id !== page.id) return p
              if (p.processedPreviewUrl && p.processedPreviewUrl !== nextUrl) {
                URL.revokeObjectURL(p.processedPreviewUrl)
              }
              return {
                ...p,
                processedPreviewUrl: nextUrl,
                processedMode: "bw",
                processing: false,
              }
            }),
          )
        } catch {
          setPages((prev) =>
            prev.map((p) => (p.id === page.id ? { ...p, processing: false } : p)),
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pages.length])
 
  const handleSubmit = async () => {
    if (submitting) return
    if (isSuccessRef.current) return
    if (isSuccessLocked) return

    const safe = () => {
      if (!isMountedRef.current) return false
      return true
    }

    const safeSetError = (msg: string | null) => {
      if (!safe()) return
      setError(msg)
    }

    const safeSetLoadingStep = (step: "processing" | "pdf" | "upload" | null) => {
      if (!safe()) return
      setLoadingStep(step)
    }

    const safeSetPages = (next: PageFile[]) => {
      if (!safe()) return
      setPages(next)
    }

    const safeSetSession = (updater: (prev: ScanSessionInfo | null) => ScanSessionInfo | null) => {
      if (!safe()) return
      setSession((prev) => updater(prev))
    }

    setSubmitting(true)

    if (!sessionId) {
      safeSetPages(pagesRef.current)
      safeSetError(null)
      if (safe()) setSubmitting(false)
      return
    }

    if (!publicToken || typeof publicToken !== "string" || publicToken.length < 10) {
      safeSetError("Token inválido.")
      if (safe()) setSubmitting(false)
      return
    }

    if (!session) {
      if (safe()) setSubmitting(false)
      return
    }

    if (session.status !== "PENDING") {
      safeSetError("La sesión ya no está pendiente.")
      if (safe()) setSubmitting(false)
      return
    }

    const pagesSnapshot = pagesRef.current.map((p) => ({
      id: p.id,
      file: p.file,
      isWarped: p.isWarped === true,
      previewUrl: p.previewUrl,
      processedPreviewUrl: p.processedPreviewUrl,
    }))

    if (pagesSnapshot.length === 0) {
      safeSetError("No hay páginas para enviar")
      if (safe()) setSubmitting(false)
      return
    }

    safeSetError(null)
    safeSetLoadingStep("processing")

    let didSuccess = false
    let uploadController: AbortController | null = null
    let uploadTimeout: any = null

    try {
      const MAX_PDF_BYTES = 5 * 1024 * 1024
      /** Longest edge cap before PDF embed (px); keeps files small without harsh loss. */
      const MAX_EDGE_PRIMARY = 1800
      const MAX_EDGE_TIGHT = 1400
      const JPEG_Q_PRIMARY = 0.85
      const JPEG_Q_REDUCED = 0.75
      const JPEG_Q_TIGHT = 0.7

      const pageWidth = 595.28 // A4 puntos 72 DPI
      const pageHeight = 841.89
      const pdfMarginPt = 16
      const availableW = pageWidth - pdfMarginPt * 2
      const availableH = pageHeight - pdfMarginPt * 2

      const reencodeJpegWithDownscale = async (
        blob: Blob,
        quality: number,
        maxEdgePx: number,
      ): Promise<Blob> => {
        const url = URL.createObjectURL(blob)
        try {
          const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error("No se pudo cargar la imagen para re-encode JPEG"))
            img.src = url
          })

          const w = imgEl.naturalWidth || imgEl.width
          const h = imgEl.naturalHeight || imgEl.height
          const maxDim = Math.max(w, h)
          const scale = maxDim > maxEdgePx ? maxEdgePx / maxDim : 1
          const cw = Math.max(1, Math.round(w * scale))
          const ch = Math.max(1, Math.round(h * scale))

          const canvas = document.createElement("canvas")
          canvas.width = cw
          canvas.height = ch
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("No se pudo crear canvas para re-encode JPEG")
          ctx.drawImage(imgEl, 0, 0, w, h, 0, 0, cw, ch)

          return await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (b) => {
                if (!isMountedRef.current) return resolve(blob)
                resolve(b ? b : blob)
              },
              "image/jpeg",
              quality,
            )
          })
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      const buildScanPdfBlob = async (
        jpegQuality: number,
        maxEdgePx: number,
      ): Promise<Blob> => {
        const pdfDoc = await PDFDocument.create()
        for (const scanPage of pagesSnapshot) {
          if (!isMountedRef.current) throw new Error("cancelled")

          const processedBlob = await processImage(scanPage.file, "bw", { skipGeometry: scanPage.isWarped })
          const jpegBlob = await reencodeJpegWithDownscale(processedBlob, jpegQuality, maxEdgePx)
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
          const img = await pdfDoc.embedJpg(jpegBytes)

          const { width, height } = img.scale(1)
          const scale = Math.min(availableW / width, availableH / height)
          const scaledWidth = width * scale
          const scaledHeight = height * scale
          const page = pdfDoc.addPage([pageWidth, pageHeight])

          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(1, 1, 1),
          })

          const x = (pageWidth - scaledWidth) / 2
          const y = (pageHeight - scaledHeight) / 2
          page.drawImage(img, { x, y, width: scaledWidth, height: scaledHeight })
        }

        const pdfBytes = await pdfDoc.save()
        const pdfArrayBuffer = pdfBytes.buffer.slice(
          pdfBytes.byteOffset,
          pdfBytes.byteOffset + pdfBytes.byteLength,
        ) as ArrayBuffer
        return new Blob([pdfArrayBuffer], { type: "application/pdf" })
      }

      // 1) PDF: build with tuned JPEG + downscale; retry if over 5MB
      safeSetLoadingStep("processing")
      let pdfBlob = await buildScanPdfBlob(JPEG_Q_PRIMARY, MAX_EDGE_PRIMARY)
      if (pdfBlob.size > MAX_PDF_BYTES) {
        safeSetLoadingStep("pdf")
        pdfBlob = await buildScanPdfBlob(JPEG_Q_REDUCED, MAX_EDGE_PRIMARY)
      }
      if (pdfBlob.size > MAX_PDF_BYTES) {
        pdfBlob = await buildScanPdfBlob(JPEG_Q_TIGHT, MAX_EDGE_TIGHT)
      }
      if (pdfBlob.size > MAX_PDF_BYTES) {
        throw new Error(
          "El PDF supera 5 MB incluso tras comprimir. Prueba con menos páginas o vuelve a escanear.",
        )
      }

      // 2) PDF stage (progress)
      safeSetLoadingStep("pdf")

      // 3) Upload stage
      const dateStr = new Date().toISOString().slice(0, 10)
      const baseDocName = session.documentName || "documento"
      const fd = new FormData()
      fd.set("file", pdfBlob, `${baseDocName}_${dateStr}.pdf`)

      safeSetLoadingStep("upload")

      uploadController = new AbortController()
      uploadTimeout = window.setTimeout(() => uploadController?.abort(), 15000)

      let fileUrl: string | undefined
      // Token-based upload: mobile scan users often have no NextAuth cookie (QR on phone).
      const uploadRes = await fetch(
        `/api/scan-sessions/${encodeURIComponent(sessionId)}/upload-file?token=${encodeURIComponent(publicToken)}`,
        {
          method: "POST",
          body: fd,
          credentials: "include",
          signal: uploadController.signal,
        },
      )
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}))
        throw new Error(data.error || "Error al subir el PDF escaneado.")
      }
      const uploadData = await uploadRes.json()
      fileUrl = uploadData.url as string | undefined
      if (!fileUrl) throw new Error("La subida no devolvió una URL válida.")

      const sessionUploadRes = await fetch(
        `/api/scan-sessions/${encodeURIComponent(sessionId)}/upload?token=${encodeURIComponent(publicToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl }),
          signal: uploadController.signal,
        },
      )

      if (sessionUploadRes.status === 401) throw new Error("Sesión inválida o ya utilizada.")
      if (!sessionUploadRes.ok) {
        const data = await sessionUploadRes.json().catch(() => ({}))
        throw new Error(data.error || "No se ha podido completar la sesión de escaneo.")
      }
      await sessionUploadRes.json().catch(() => null)

      didSuccess = true
      isSuccessRef.current = true
      if (safe()) setIsSuccessLocked(true)

      safeSetLoadingStep(null)
      safeSetError(null)
      if (safe()) setShowSuccessScreen(true)

      successTimeoutRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return

        setShowSuccessScreen(false)
        setIsSuccessLocked(false)
        isSuccessRef.current = false

        const urlsToRevoke = new Set<string>()
        const pagesNow = pagesRef.current
        for (const p of pagesNow) {
          if (p.previewUrl) urlsToRevoke.add(p.previewUrl)
          if (p.processedPreviewUrl) urlsToRevoke.add(p.processedPreviewUrl)
        }
        urlsToRevoke.forEach((u) => URL.revokeObjectURL(u))

        safeSetPages([])
        safeSetSession((prev) =>
          prev ? { ...prev, status: "UPLOADED", fileUrl: prev.fileUrl ?? fileUrl } : prev,
        )
        if (safe()) setSubmitting(false)
      }, 950)
    } catch (err: any) {
      const messageBase =
        err?.name === "AbortError"
          ? "La conexión ha tardado demasiado."
          : err?.message || "No se pudo completar el proceso. Inténtalo de nuevo."
      const normalized = `${messageBase} Revisa tu conexión.`

      if (safe()) {
        setShowSuccessScreen(false)
        setIsSuccessLocked(false)
        isSuccessRef.current = false
        safeSetLoadingStep(null)
        setError(normalized)
        setSubmitting(false)
      }
      return
    } finally {
      if (!didSuccess) {
        if (safe()) {
          setSubmitting(false)
          safeSetLoadingStep(null)
        }
      }
      if (uploadTimeout) window.clearTimeout(uploadTimeout)
    }
  }

  const handleDragStart = (index: number) => {
    if (isSuccessLocked) return
    setDragIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (isSuccessLocked) return
    if (dragIndex === null || dragIndex === index) return

    setPages((prev) => {
      const copy = [...prev]
      const draggedItem = copy[dragIndex]
      if (!draggedItem) return prev
      copy.splice(dragIndex, 1)
      copy.splice(index, 0, draggedItem)
      return copy
    })

    setDragIndex(index)
  }

  const handleDragEnd = () => {
    if (isSuccessLocked) return
    setDragIndex(null)
  }

  useEffect(() => {
    if (!reviewMode && editingPage) setEditingPage(null)
  }, [reviewMode, editingPage])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Cargando sesión de escaneo…
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-3">
        <p className="text-sm text-neutral-500">Sesión de escaneo no encontrada.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  if (session.status === "EXPIRED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Sesión de escaneo caducada</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Esta sesión ha expirado. Vuelve a generar el código desde ClientLabs en tu ordenador.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  if (session.status === "COMPLETED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Documento enviado</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          El documento escaneado se ha enviado correctamente. Puedes continuar en ClientLabs en tu ordenador.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  if (session.status === "UPLOADED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-3">
        <h1 className="text-base font-semibold text-[var(--text-primary)]">Documento recibido</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          El documento ya está subido. Ahora el proveedor debe confirmarlo desde ClientLabs en su ordenador.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  if (showSuccessScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4 bg-[var(--bg-main)]">
        <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 6L9 17L4 12"
              stroke="#00FFAA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-[var(--text-primary)]">Documento listo</h1>
          <p className="text-sm text-[var(--text-secondary)]">Se ha enviado correctamente</p>
        </div>
      </div>
    )
  }

  if (submitting && loadingStep) {
    const stepTitle =
      loadingStep === "processing"
        ? "Mejorando calidad…"
        : loadingStep === "pdf"
          ? "Generando PDF…"
          : "Subiendo documento…"

    return (
      <div className="fixed inset-0 z-[100] bg-black/70 transition-opacity duration-200 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          <p className="text-sm text-white text-center">{stepTitle}</p>
          <p className="text-xs text-white/80 text-center">Por favor, no cierres la pantalla</p>
        </div>
      </div>
    )
  }

  const canSubmit = pages.length > 0 && !submitting

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            {reviewMode ? "Revisa tu documento" : "Escanear documento"}
          </p>
          <h1 className="text-lg font-semibold">
            {session.documentName}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Tipo: <span className="font-medium">{session.category}</span>
          </p>
        </header>

        <section className="space-y-3">
          {reviewMode && (
            <div className="space-y-1 pb-1">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Revisa tu documento</h2>
              <p className="text-xs text-[var(--text-secondary)]">Ordena y ajusta antes de enviarlo</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">
              {pages.length} {pages.length === 1 ? "página" : "páginas"} escaneadas
            </Label>
            {pages.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]/40 py-8 px-4 flex flex-col items-center justify-center text-center gap-2 opacity-70">
                <div className="text-2xl leading-none" aria-hidden="true">
                  📄
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Añade páginas para comenzar</p>
              </div>
            ) : (
              <div
                className={`space-y-2 ${reviewMode ? "max-h-[50vh] overflow-y-auto pr-1" : ""}`}
              >
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-2 transition-all duration-200 ease-out ${
                      newlyAddedPageIds.has(page.id) ? "opacity-0 scale-[0.96]" : "opacity-100 scale-100"
                    } ${
                      dragIndex === index ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    <div className="relative w-14 h-20 overflow-hidden rounded border border-[var(--border-subtle)] bg-black/5 shrink-0">
                      <img
                        src={page.processedPreviewUrl || page.previewUrl}
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedPage(page)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        Página {index + 1}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {page.file.name}
                      </p>
                      {page.processing && (
                        <p className="text-[10px] text-[var(--text-muted)]">Procesando previsualización…</p>
                      )}
                    </div>
                    {reviewMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                        disabled={submitting || isSuccessLocked}
                        onClick={() => {
                          setSelectedPage(null)
                          setEditingPage(page)
                        }}
                      >
                        Editar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      disabled={submitting || isSuccessLocked}
                      onClick={() => handleRemovePage(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!reviewMode && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] active:scale-95 active:opacity-90 transition-all duration-100"
                onClick={() => {
                  setSelectedPage(null)
                  setScannerOpen(true)
                }}
              >
                Añadir página
              </Button>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <footer className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2 sticky bottom-0 bg-[var(--bg-main)]">
          {!reviewMode ? (
            <>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || isSuccessLocked}
                className="bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 active:opacity-90 transition-all duration-100"
              >
                {submitting ? "Procesando documento…" : "Finalizar documento"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar y volver al panel
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={pages.length === 0 || submitting || isSuccessLocked}
                className="bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 active:opacity-90 transition-all duration-100"
              >
                {submitting ? "Procesando documento…" : "Confirmar y enviar"}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] active:scale-95 active:opacity-90 transition-all duration-100"
                  onClick={() => {
                    setReviewMode(false)
                    setSelectedPage(null)
                    setError(null)
                  }}
                  disabled={submitting || isSuccessLocked}
                >
                  Añadir más páginas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={handleDeleteAll}
                  disabled={pages.length === 0 || submitting || isSuccessLocked}
                >
                  Eliminar todo
                </Button>
              </div>
            </>
          )}
        </footer>
        </div>
      </div>

      {selectedPage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 transition-opacity duration-200 flex items-center justify-center p-4"
          onClick={() => setSelectedPage(null)}
        >
          <img
            src={selectedPage.processedPreviewUrl || selectedPage.previewUrl}
            alt="Vista completa"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4"
            onClick={() => setSelectedPage(null)}
          >
            Cerrar
          </Button>
        </div>
      )}

      {editingPage && (
        <EdgeEditor
          image={editingPage.processedPreviewUrl || editingPage.previewUrl}
          initialCorners={editingPage.corners}
          onConfirm={handleApplyCorners}
          onCancel={() => setEditingPage(null)}
        />
      )}

      {scannerOpen && (
        <div className="transition-opacity duration-200">
          <LiveScanner
            onCapture={handleCapture}
            onCancel={() => {
              setScannerOpen(false)
            }}
            onFinish={() => {
              setScannerOpen(false)
              if (pagesRef.current.length > 0) setReviewMode(true)
            }}
            pageCount={pages.length}
          />
        </div>
      )}
    </>
  )
}

