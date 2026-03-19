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
  file: File
  previewUrl: string
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pagesRef = useRef<PageFile[]>([])

  useEffect(() => {
    if (!sessionId) return
    if (!publicToken) {
      setLoading(false)
      setError("Token inválido.")
      return
    }

    let cancelled = false

    const loadSession = async () => {
      try {
        const res = await fetch(
          `/api/scan-sessions/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(publicToken)}`,
        )

        if (!res.ok) {
          if (!cancelled) setError("Error cargando sesión")
          return
        }

        const data = await res.json().catch(() => null)

        if (!data || !data.status) {
          if (!cancelled) setError("Sesión no encontrada")
          return
        }

        if (data.status === "EXPIRED") {
          if (!cancelled) setError("Sesión expirada")
          return
        }

        if (!cancelled) setSession(data as ScanSessionInfo)
      } catch (err) {
        if (!cancelled) setError("Error de red")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [sessionId, publicToken])

  const handleAddPages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const next: PageFile[] = []
    for (const f of files) {
      next.push({
        file: f,
        previewUrl: URL.createObjectURL(f),
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
      removed.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      return copy
    })
  }

  useEffect(() => {
    pagesRef.current = pages
  }, [pages])

  useEffect(() => {
    // cleanup previews on unmount
    return () => {
      pagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
  }, [])
 
  if (!publicToken) {
    setError("Token inválido (no presente en URL)")
    return
  }
  const handleSubmit = async () => {
    if (!sessionId) return
    if (!publicToken) {
      setError("Token inválido.")
      return
    }
    if (!session) return
    if (session.status !== "PENDING") {
      setError("La sesión ya no está pendiente.")
      return
    }
    if (pages.length === 0) {
      setError("Añade al menos una página para continuar.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      // 1. Generar PDF multipágina A4
      const pdfDoc = await PDFDocument.create()
      const pageWidth = 595.28 // A4 puntos 72 DPI
      const pageHeight = 841.89

      for (const { file } of pages) {
        const imageUrl = URL.createObjectURL(file)
        try {
          const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error("No se pudo cargar la imagen capturada"))
            img.src = imageUrl
          })

          const canvas = document.createElement("canvas")
          canvas.width = imgEl.naturalWidth || imgEl.width
          canvas.height = imgEl.naturalHeight || imgEl.height
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("No se pudo crear el contexto de canvas")
          ctx.drawImage(imgEl, 0, 0)

          const jpegBlob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Error al convertir a JPEG"))),
              "image/jpeg",
              0.85,
            )
          })
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
          const img = await pdfDoc.embedJpg(jpegBytes)

          const { width, height } = img.scale(1)
          const scale = Math.min(pageWidth / width, pageHeight / height)
          const scaledWidth = width * scale
          const scaledHeight = height * scale
          const page = pdfDoc.addPage([pageWidth, pageHeight])
          const x = (pageWidth - scaledWidth) / 2
          const y = (pageHeight - scaledHeight) / 2
          page.drawImage(img, { x, y, width: scaledWidth, height: scaledHeight })
        } finally {
          URL.revokeObjectURL(imageUrl)
        }
      }

      const pdfBytes = await pdfDoc.save()
      // pdfBytes is Uint8Array; convert its buffer to an ArrayBuffer BlobPart
      const pdfBlob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })

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

      console.log("TOKEN FRONT:", publicToken)
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
      if (!sessionUploadRes.ok) {
        const data = await sessionUploadRes.json().catch(() => ({}))
        throw new Error(data.error || "No se ha podido completar la sesión de escaneo.")
      }

      // cleanup previews tras éxito
      pages.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      setPages([])
      setSession((prev) => (prev ? { ...prev, status: "UPLOADED", fileUrl } : prev))
    } catch (err: any) {
      setError(err?.message || "Error al guardar el documento escaneado.")
    } finally {
      setSubmitting(false)
    }
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
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] p-2"
                  >
                    <div className="relative w-14 h-20 overflow-hidden rounded border border-[var(--border-subtle)] bg-black/5 shrink-0">
                      <img
                        src={page.previewUrl}
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        Página {index + 1}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {page.file.name}
                      </p>
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
            disabled={!canSubmit}
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
  )
}

