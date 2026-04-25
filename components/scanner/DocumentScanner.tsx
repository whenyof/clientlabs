"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, Upload, X, Check, Loader2, FileText, Image } from "lucide-react"
import dynamic from "next/dynamic"

const LiveScanner = dynamic(() => import("./LiveScanner").then(m => ({ default: m.LiveScanner })), { ssr: false })

interface DocumentScannerProps {
  onDocument: (file: File) => void
  onClose: () => void
  title?: string
  accept?: string
}

type Mode = "select" | "camera" | "file" | "preview"

/**
 * DocumentScanner — Modal-style component for capturing or importing documents.
 *
 * Features:
 * 1. Two options: "Escanear con cámara" and "Importar archivo"
 * 2. Camera: uses getUserMedia / LiveScanner for mobile
 * 3. File picker: accepts PDF, image/*
 * 4. Preview before confirm
 * 5. Calls onDocument with the processed file
 */
export function DocumentScanner({
  onDocument,
  onClose,
  title = "Añadir documento",
  accept = "application/pdf,image/*",
}: DocumentScannerProps) {
  const [mode, setMode] = useState<Mode>("select")
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCameraCapture = useCallback((blob: Blob) => {
    const file = new File([blob], `scan_${Date.now()}.jpg`, { type: "image/jpeg" })
    const url = URL.createObjectURL(blob)
    setPreviewFile(file)
    setPreviewUrl(url)
    setMode("preview")
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewFile(file)
    setPreviewUrl(url)
    setMode("preview")
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!previewFile) return
    setUploading(true)
    try {
      onDocument(previewFile)
    } finally {
      setUploading(false)
    }
  }, [previewFile, onDocument])

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewFile(null)
    setPreviewUrl(null)
    setMode("select")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [previewUrl])

  const isPdf = previewFile?.type === "application/pdf"

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#1FA97A15",
            border: "1px solid #1FA97A25",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <FileText style={{ width: 16, height: 16, color: "#1FA97A" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
              {title}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              {mode === "select" ? "Elige cómo añadir el documento"
                : mode === "camera" ? "Apunta la cámara al documento"
                : mode === "preview" ? "Revisa el documento antes de confirmar"
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 8,
              color: "var(--text-secondary)",
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>

          {/* SELECT mode */}
          {mode === "select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Camera option */}
              <button
                type="button"
                onClick={() => setMode("camera")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.12s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1FA97A" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)" }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#3B82F610",
                  border: "1px solid #3B82F620",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Camera style={{ width: 20, height: 20, color: "#3B82F6" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                    Escanear con cámara
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    Usa la cámara de tu dispositivo
                  </p>
                </div>
              </button>

              {/* File import option */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.12s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1FA97A" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)" }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#1FA97A10",
                  border: "1px solid #1FA97A20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Upload style={{ width: 20, height: 20, color: "#1FA97A" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                    Importar archivo
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    PDF, JPG, PNG hasta 10MB
                  </p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* CAMERA mode */}
          {mode === "camera" && (
            <div style={{ position: "relative", background: "#000", borderRadius: 12, overflow: "hidden", minHeight: 300 }}>
              <LiveScanner
                onCapture={handleCameraCapture}
                onCancel={() => setMode("select")}
              />
            </div>
          )}

          {/* PREVIEW mode */}
          {mode === "preview" && previewFile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Preview */}
              <div style={{
                borderRadius: 12,
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                maxHeight: 320,
              }}>
                {isPdf ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 30 }}>
                    <FileText style={{ width: 48, height: 48, color: "#EF4444" }} />
                    <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, margin: 0, textAlign: "center" }}>
                      {previewFile.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      {(previewFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                ) : previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Vista previa del documento"
                    style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <Image style={{ width: 40, height: 40, color: "var(--text-secondary)" }} />
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Vista previa no disponible</p>
                  </div>
                )}
              </div>

              {/* File info */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}>
                <FileText style={{ width: 16, height: 16, color: "var(--text-secondary)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {previewFile.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    {previewFile.type} · {(previewFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === "preview" || mode === "select") && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
          }}>
            <button
              type="button"
              onClick={mode === "preview" ? handleReset : onClose}
              style={{
                padding: "9px 18px",
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {mode === "preview" ? "Cambiar" : "Cancelar"}
            </button>

            {mode === "preview" && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={uploading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 22px",
                  background: "#1FA97A",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  opacity: uploading ? 0.5 : 1,
                  transition: "opacity 0.12s",
                }}
              >
                {uploading
                  ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                  : <Check style={{ width: 14, height: 14 }} />}
                {uploading ? "Procesando..." : "Confirmar"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
