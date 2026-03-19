/* Mobile scan session page V1: captura páginas, genera PDF y completa la sesión */
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
}

async function processImage(file: File, mode: "color" | "bw" | "contrast"): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file)

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

    const targetWidth = Math.max(600, Math.round((topW + bottomW) / 2))
    // A4-like ratio (h/w ~ 1.414) limitado por geometría detectada.
    const rawTargetHeight = Math.max(Math.round((leftH + rightH) / 2), Math.round(targetWidth * 1.2))
    const a4TargetHeight = Math.round(targetWidth * Math.SQRT2)
    const targetHeight = Math.max(700, Math.round((rawTargetHeight + a4TargetHeight) / 2))

    const warpedCanvas = document.createElement("canvas")
    warpedCanvas.width = targetWidth
    warpedCanvas.height = targetHeight
    const warpedCtx = warpedCanvas.getContext("2d")
    if (!warpedCtx) throw new Error("No se pudo crear el contexto de perspectiva")

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
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<ScanSessionInfo | null>(null)
  const [pages, setPages] = useState<PageFile[]>([])
  const [selectedPage, setSelectedPage] = useState<PageFile | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [filterMode, setFilterMode] = useState<"color" | "bw" | "contrast">("bw")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pagesRef = useRef<PageFile[]>([])
  const previewGenerationRef = useRef(0)

  useEffect(() => {
    if (!sessionId) return

    // Reset local view state whenever session changes to avoid stale UI.
    setSession(null)
    setError(null)
    setLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const loadSession = async () => {
      // Unified guard + loading/error handling to avoid split state transitions.
      if (!publicToken || typeof publicToken !== "string" || publicToken.length < 10) {
        setError("Token inválido.")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(
          `/api/scan-sessions/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(publicToken)}`,
          { signal: controller.signal },
        )

        if (!res.ok) {
          setError("Error cargando sesión")
          return
        }

        const data = await res.json().catch(() => null)

        if (!data || !data.status) {
          setError("Sesión no encontrada")
          return
        }

        if (data.status === "EXPIRED") {
          setError("Sesión expirada")
          return
        }

        setSession(data as ScanSessionInfo)
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          setError("La conexión ha tardado demasiado.")
          return
        }
        setError("Error de red")
      } finally {
        clearTimeout(timeout)
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      controller.abort()
    }
  }, [sessionId, publicToken])

  const handleAddPages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
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
    setPages((prev) => {
      const combined = [...prev, ...next]
      return combined.slice(0, 10)
    })
    e.target.value = ""
  }

  const handleRemovePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev]
      const removed = copy.splice(index, 1)
      removed.forEach((p) => {
        URL.revokeObjectURL(p.previewUrl)
        if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
      })
      return copy
    })
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
    if (selectedPage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedPage])

  useEffect(() => {
    if (pagesRef.current.length === 0) return

    const generation = ++previewGenerationRef.current
    let cancelled = false

    // marca estado de procesamiento para feedback UX
    setPages((prev) => prev.map((p) => ({ ...p, processing: true })))

    ;(async () => {
      for (const page of pagesRef.current) {
        if (cancelled || generation !== previewGenerationRef.current) return
        if (page.processedPreviewUrl && page.processedMode === filterMode && !page.processing) {
          continue
        }
        try {
          const processedBlob = await processImage(page.file, filterMode)
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
                processedMode: filterMode,
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
  }, [filterMode])
 
  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    if (!sessionId) {
      setSubmitting(false)
      return
    }
    if (!publicToken || typeof publicToken !== "string" || publicToken.length < 10) {
      setError("Token inválido.")
      setSubmitting(false)
      return
    }
    if (!session) {
      setSubmitting(false)
      return
    }
    if (session.status !== "PENDING") {
      setError("La sesión ya no está pendiente.")
      setSubmitting(false)
      return
    }
    if (pages.length === 0) {
      setError("Añade al menos una página para continuar.")
      setSubmitting(false)
      return
    }
    setError(null)
    try {
      // 1. Generar PDF multipágina A4
      const pdfDoc = await PDFDocument.create()
      const pageWidth = 595.28 // A4 puntos 72 DPI
      const pageHeight = 841.89

      for (const { file } of pages) {
        const processedBlob = await processImage(file, filterMode)
        const jpegBytes = new Uint8Array(await processedBlob.arrayBuffer())
        const img = await pdfDoc.embedJpg(jpegBytes)

        const { width, height } = img.scale(1)
        const scale = Math.min(pageWidth / width, pageHeight / height)
        const scaledWidth = width * scale
        const scaledHeight = height * scale
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        const x = (pageWidth - scaledWidth) / 2
        const y = (pageHeight - scaledHeight) / 2
        page.drawImage(img, { x, y, width: scaledWidth, height: scaledHeight })
      }

      const pdfBytes = await pdfDoc.save()
      const pdfArrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength,
      ) as ArrayBuffer
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" })

      // 2. Subir PDF reutilizando el flujo de upload existente
      const fd = new FormData()
      fd.set("file", pdfBlob, `${session.documentName || "documento"}.pdf`)
      const uploadRes = await fetch("/api/providers/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      })
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}))
        throw new Error(data.error || "Error al subir el PDF escaneado.")
      }
      const uploadData = await uploadRes.json()
      const fileUrl = uploadData.url as string | undefined
      if (!fileUrl) {
        throw new Error("La subida no devolvió una URL válida.")
      }

      // 3. Marcar la sesión como subida (UPLOADED); la confirmación final se hace en desktop
      const sessionUploadRes = await fetch(
        `/api/scan-sessions/${encodeURIComponent(sessionId)}/upload?token=${encodeURIComponent(publicToken)}`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
        },
      )
      if (sessionUploadRes.status === 401) {
        throw new Error("Sesión inválida o ya utilizada.")
      }
      if (!sessionUploadRes.ok) {
        const data = await sessionUploadRes.json().catch(() => ({}))
        throw new Error(data.error || "No se ha podido completar la sesión de escaneo.")
      }
      const uploadSessionData = await sessionUploadRes.json().catch(() => null)
      if (uploadSessionData?.alreadyProcessed) {
        pages.forEach((p) => {
          URL.revokeObjectURL(p.previewUrl)
          if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
        })
        setPages([])
        setSession((prev) =>
          prev ? { ...prev, status: "UPLOADED", fileUrl: prev.fileUrl ?? fileUrl } : prev
        )
        return
      }

      // cleanup previews tras éxito
      pages.forEach((p) => {
        URL.revokeObjectURL(p.previewUrl)
        if (p.processedPreviewUrl) URL.revokeObjectURL(p.processedPreviewUrl)
      })
      setPages([])
      setSession((prev) => (prev ? { ...prev, status: "UPLOADED", fileUrl } : prev))
    } catch (err: any) {
      setError(err?.message || "Error al guardar el documento escaneado.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragEnter = (index: number) => {
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
    setDragIndex(null)
  }

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

  const canSubmit = pages.length > 0 && !submitting

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Escanear documento
          </p>
          <h1 className="text-lg font-semibold">
            {session.documentName}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Tipo: <span className="font-medium">{session.category}</span>
          </p>
        </header>

        <section className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Filtro</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={filterMode === "color" ? "default" : "outline"}
                onClick={() => setFilterMode("color")}
              >
                Color
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filterMode === "bw" ? "default" : "outline"}
                onClick={() => setFilterMode("bw")}
              >
                B/N
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filterMode === "contrast" ? "default" : "outline"}
                onClick={() => setFilterMode("contrast")}
              >
                Alto contraste
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Páginas</Label>
            {pages.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Aún no has añadido ninguna página. Usa el botón de abajo para capturar el documento con la
                cámara de tu móvil.
              </p>
            ) : (
              <div className="space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-2 ${
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRemovePage(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
              onClick={() => fileInputRef.current?.click()}
            >
              Añadir página
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleAddPages}
            />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <footer className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="bg-[var(--accent)] text-white hover:opacity-90"
          >
            {submitting ? "Guardando…" : "Guardar documento"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => router.push("/dashboard")}
          >
            Cancelar y volver al panel
          </Button>
        </footer>
        </div>
      </div>

      {selectedPage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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
    </>
  )
}

