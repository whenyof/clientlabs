"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeCanvas } from "qrcode.react"

type ScanSessionStatus = "PENDING" | "UPLOADED" | "COMPLETED" | "EXPIRED"

type ScanSessionResponse = {
  status: ScanSessionStatus
  documentName: string
  category: string
  fileUrl: string | null
  expiresAt: string
}

export type ScanWithMobileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: "PROVIDER" | "ORDER" | "PAYMENT"
  entityId: string
  category: "INVOICE" | "ORDER" | "ORDER_SHEET" | "OTHER" | "CONTRACT"
  documentName: string
  onCompleted: (result: { fileUrl: string }) => void
}

export function ScanWithMobileDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  category,
  documentName,
  onCompleted,
}: ScanWithMobileDialogProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [scanUrl, setScanUrl] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [status, setStatus] = useState<ScanSessionStatus | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createAttempt, setCreateAttempt] = useState(0)
  const completedRef = useRef(false)

  // Crear una nueva ScanSession cada vez que se abre
  useEffect(() => {
    if (!open) {
      // al cerrar, solo limpiamos errores; no cancelamos la sesión en backend
      completedRef.current = false
      setError(null)
      return
    }

    let cancelled = false
    const createSession = async () => {
      try {
        setCreating(true)
        setError(null)
        setStatus(null)
        setFileUrl(null)
        setSessionId(null)
        setScanUrl(null)
        setExpiresAt(null)

        const res = await fetch("/api/scan-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            entityType,
            entityId,
            category,
            documentName,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (!cancelled) {
            setError(data.error || "No se ha podido crear la sesión de escaneo.")
          }
          return
        }
        const data = await res.json() as { sessionId: string; scanUrl: string; expiresAt: string }
        if (!cancelled) {
          setSessionId(data.sessionId)
          setScanUrl(data.scanUrl)
          setExpiresAt(data.expiresAt)
          try {
            const url = new URL(data.scanUrl)
            const token = url.searchParams.get("token")
            setPublicToken(token)
          } catch {
            setPublicToken(null)
          }
          setStatus("PENDING")
        }
      } catch {
        if (!cancelled) {
          setError("Error al crear la sesión de escaneo.")
        }
      } finally {
        if (!cancelled) setCreating(false)
      }
    }

    createSession()
    return () => {
      cancelled = true
    }
  }, [open, entityType, entityId, category, documentName, createAttempt])

  // Polling para comprobar el estado de la sesión
  useEffect(() => {
    if (!open || !sessionId || !publicToken) return
    if (status === "COMPLETED" || status === "EXPIRED" || status === "UPLOADED") return

    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan-sessions/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(publicToken)}`, {
          method: "GET",
          credentials: "include",
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (!cancelled) setError(data.error || "Error al consultar la sesión de escaneo.")
          return
        }
        const data = await res.json() as ScanSessionResponse
        if (cancelled) return
        setStatus(data.status)
        setExpiresAt(data.expiresAt)
        if (data.status === "UPLOADED" && data.fileUrl && !completedRef.current) {
          setPendingFileUrl(data.fileUrl)
        }
        if (data.status === "COMPLETED" && data.fileUrl && !completedRef.current) {
          completedRef.current = true
          setFileUrl(data.fileUrl)
          onCompleted({ fileUrl: data.fileUrl })
          onOpenChange(false)
        }
      } catch {
        if (!cancelled) {
          setError("Error al consultar la sesión de escaneo.")
        }
      }
    }, 2500)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [open, sessionId, status, onCompleted, onOpenChange, publicToken])

  const handleGenerateNew = () => {
    // Crea una nueva sesión reiniciando el estado local; el useEffect de creación se encargará
    setSessionId(null)
    setScanUrl(null)
    setStatus(null)
    setFileUrl(null)
    setError(null)
    // forzar nuevo ciclo de creación incrementando el contador
    setCreateAttempt((v) => v + 1)
  }

  const handleConfirmAttach = async () => {
    if (!sessionId || !pendingFileUrl) return
    try {
      const res = await fetch(`/api/scan-sessions/${encodeURIComponent(sessionId)}/confirm`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "No se ha podido confirmar el documento.")
        return
      }
      completedRef.current = true
      onCompleted({ fileUrl: pendingFileUrl })
      onOpenChange(false)
    } catch {
      setError("No se ha podido confirmar el documento.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[var(--bg-card)] border-[var(--border-main)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)] text-base sm:text-lg">
            Escanear con el móvil
          </DialogTitle>
          <p className="text-xs text-[var(--text-secondary)]">
            Escanea este código QR con tu móvil para capturar y enviar el documento a ClientLabs.
          </p>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center justify-center gap-3 py-3">
          {creating && (
            <p className="text-sm text-[var(--text-secondary)]">
              Creando sesión de escaneo…
            </p>
          )}
          {!creating && status !== "UPLOADED" && scanUrl && (
            <>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <QRCodeCanvas value={scanUrl} size={180} />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] text-center max-w-xs">
                Abre la cámara de tu móvil o la app de escaneo de códigos QR y apunta a este código para abrir el
                flujo de escaneo de ClientLabs.
              </p>
            </>
          )}
          {status === "EXPIRED" && (
            <p className="text-sm text-amber-600">
              Esta sesión ha caducado. Puedes generar un nuevo código.
            </p>
          )}
          {status === "UPLOADED" && pendingFileUrl && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-[var(--text-primary)] font-medium">Documento recibido</p>
              <p className="text-[11px] text-[var(--text-secondary)] text-center max-w-xs">
                Revisa el documento y confirma si quieres adjuntarlo al proveedor.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <div className="flex gap-2 justify-end">
            {status === "EXPIRED" && (
              <Button
                type="button"
                variant="outline"
                className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                onClick={handleGenerateNew}
                disabled={creating}
              >
                Generar nuevo código
              </Button>
            )}
            {status === "UPLOADED" && pendingFileUrl && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                  onClick={() => window.open(pendingFileUrl, "_blank")}
                >
                  Ver documento
                </Button>
                <Button
                  type="button"
                  className="bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                  onClick={handleConfirmAttach}
                >
                  Confirmar y adjuntar
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

