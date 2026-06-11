"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Link2Off, FileText, Download } from "lucide-react"

// A4 a 96 dpi — las mismas dimensiones que el visor del navegador usa por defecto
const PDF_W = 794
const PDF_H = 1123

interface DocViewData {
  view: {
    id: string
    type: string
    status: string
    recipientName: string
    decidedAt: string | null
    signatureName: string | null
    rejectionReason: string | null
    expiresAt: string | null
  }
  document: Record<string, unknown> | null
  sender: { name: string | null } | null
}

type LoadState = "loading" | "not_found" | "expired" | "loaded" | "error"

const FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"

export default function DocViewPage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<LoadState>("loading")
  const [data, setData] = useState<DocViewData | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [signatureName, setSignatureName] = useState("")
  const [signatureChecked, setSignatureChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [decided, setDecided] = useState<"accepted" | "rejected" | null>(null)

  // Para el cálculo del scale del PDF
  const pdfAreaRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  // Medir el contenedor disponible y calcular scale
  useEffect(() => {
    const el = pdfAreaRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setScale(Math.min(width / PDF_W, height / PDF_H))
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [state]) // re-registrar cuando el elemento aparece tras la carga

  useEffect(() => {
    fetch(`/api/doc/${token}`)
      .then(async (r) => {
        if (r.status === 404) { setState("not_found"); return }
        if (r.status === 410) { setState("expired"); return }
        if (!r.ok) { setState("error"); return }
        setData(await r.json())
        setState("loaded")
      })
      .catch(() => setState("error"))
  }, [token])

  async function handleAccept() {
    if (!signatureName.trim() || !signatureChecked) return
    setActionLoading(true)
    const r = await fetch(`/api/doc/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", signatureName: signatureName.trim() }),
    })
    setActionLoading(false)
    if (r.ok) setDecided("accepted")
  }

  async function handleReject() {
    setActionLoading(true)
    const r = await fetch(`/api/doc/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectReason.trim() || undefined }),
    })
    setActionLoading(false)
    if (r.ok) { setDecided("rejected"); setShowRejectModal(false) }
  }

  const view = data?.view
  const doc  = data?.document
  const isQuote = view?.type === "QUOTE"

  const pdfUrl = `/api/doc/${token}/pdf`

  const senderName = (doc?.issuedCompanySnapshot as Record<string, string> | null)?.companyName
    ?? (doc?.user as Record<string, unknown> | null)?.name as string | null
    ?? (doc?.User as Record<string, unknown> | null)?.name as string | null
    ?? data?.sender?.name
    ?? "Remitente"

  const docNumber = (doc?.number as string) ?? ""

  const canDecide = isQuote && !decided &&
    view?.status !== "ACCEPTED" && view?.status !== "REJECTED" && view?.status !== "EXPIRED"

  const already = decided ?? (
    view?.status === "ACCEPTED" ? "accepted" :
    view?.status === "REJECTED" ? "rejected" : null
  )

  if (state === "loading") return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F8FA" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E5E9ED", borderTopColor: "#0F766E", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FONT, color: "#7C8B96", fontSize: 14, margin: 0 }}>Cargando…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (state === "not_found") return <StatusPage icon="link-broken" title="Este enlace no existe"    description="El enlace no es válido o el documento ha sido eliminado. Contacta con el remitente." />
  if (state === "expired")   return <StatusPage icon="clock"       title="Este enlace ha expirado" description="El período de validez de este documento ha terminado. Contacta con el remitente para recibir un nuevo enlace." />
  if (state === "error")     return <StatusPage icon="error"       title="Error al cargar"          description="Error al cargar. Inténtalo de nuevo." />

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT, background: "#525659" }}>

      {/* Topbar */}
      <div style={{ flexShrink: 0, background: "#0B1F2A", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        <FileText size={16} color="#1FA97A" />
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{senderName}</span>
        <span style={{ color: "#64788A", fontSize: 12, marginLeft: "auto" }}>
          {isQuote ? "Presupuesto" : "Factura"} {docNumber}
        </span>
        <a
          href={pdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid #2D4A5A", color: "#CBD5E1", fontSize: 12, fontWeight: 500, textDecoration: "none", marginLeft: 8, whiteSpace: "nowrap" }}
        >
          <Download size={12} />
          Descargar PDF
        </a>
      </div>

      {/* Status banners */}
      {already === "accepted" && (
        <div style={{ flexShrink: 0, background: "#ECFDF5", borderBottom: "1px solid #A7F3D0", padding: "8px 20px", display: "flex", alignItems: "center", gap: 7 }}>
          <CheckCircle size={14} color="#059669" />
          <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>
            Aceptado el {view?.decidedAt ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(view.decidedAt)) : "—"} por {view?.signatureName}
          </span>
        </div>
      )}
      {already === "rejected" && (
        <div style={{ flexShrink: 0, background: "#FEF2F2", borderBottom: "1px solid #FCA5A5", padding: "8px 20px", display: "flex", alignItems: "center", gap: 7 }}>
          <XCircle size={14} color="#DC2626" />
          <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 600 }}>
            Rechazado{view?.rejectionReason ? `: "${view.rejectionReason}"` : ""}
          </span>
        </div>
      )}

      {/* Área principal: PDF + panel de firma lateral (apilado en móvil) */}
      <div className="docp-main" style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* PDF viewer con CSS scale — funciona en todos los navegadores incluyendo Safari */}
        <div
          ref={pdfAreaRef}
          style={{ flex: 1, overflow: "hidden", minWidth: 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}
        >
          {scale > 0 ? (
            // Wrapper que ocupa exactamente el espacio escalado para que no haya desbordamiento
            <div style={{ width: PDF_W * scale, height: PDF_H * scale, flexShrink: 0, overflow: "hidden" }}>
              <object
                data={pdfUrl}
                type="application/pdf"
                style={{
                  width: PDF_W,
                  height: PDF_H,
                  display: "block",
                  border: "none",
                  transformOrigin: "top left",
                  transform: `scale(${scale})`,
                }}
              >
                {/* Fallback: mobile Safari y navegadores sin visor PDF inline */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, background: "#F0F2F5" }}>
                  <FileText size={44} color="#7C8B96" />
                  <p style={{ fontFamily: FONT, color: "#3F4D58", fontSize: 14, margin: 0, textAlign: "center", padding: "0 24px" }}>
                    Tu navegador no puede mostrar el PDF directamente.
                  </p>
                  <a
                    href={pdfUrl}
                    download
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#0F766E", color: "#fff", borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                  >
                    <Download size={14} />
                    Abrir PDF
                  </a>
                </div>
              </object>
            </div>
          ) : null}
        </div>

        {/* Panel de firma lateral — solo presupuestos pendientes */}
        {canDecide && (
          <div className="docp-panel" style={{ flexShrink: 0, width: 272, borderLeft: "1px solid #3A4A54", background: "#fff", overflowY: "auto", padding: "22px 18px", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#0B1F2A", margin: "0 0 6px" }}>Firma este presupuesto</h2>
            <p style={{ fontFamily: FONT, fontSize: 12, color: "#7C8B96", margin: "0 0 18px", lineHeight: 1.5 }}>
              Lee el documento y, si estás de acuerdo, fírmalo aquí.
            </p>

            <label style={{ display: "block", fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "#3F4D58", marginBottom: 5 }}>
              Tu nombre completo *
            </label>
            <input
              type="text"
              autoComplete="name"
              value={signatureName}
              onChange={e => setSignatureName(e.target.value)}
              placeholder="Juan García Martínez"
              style={{ width: "100%", padding: "9px 10px", border: "1px solid #E2E6EA", borderRadius: 6, fontSize: 13, color: "#0B1F2A", outline: "none", boxSizing: "border-box", fontFamily: FONT, marginBottom: 14 }}
            />

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={signatureChecked}
                onChange={e => setSignatureChecked(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#0F766E", width: 14, height: 14, flexShrink: 0 }}
              />
              <span style={{ fontFamily: FONT, fontSize: 11, color: "#3F4D58", lineHeight: 1.5 }}>
                Acepto los términos de este presupuesto y autorizo la firma electrónica.
              </span>
            </label>

            <button
              onClick={handleAccept}
              disabled={!signatureName.trim() || !signatureChecked || actionLoading}
              style={{
                width: "100%", padding: "10px 0",
                background: (!signatureName.trim() || !signatureChecked) ? "#D1D5DB" : "#0F766E",
                color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700,
                cursor: (!signatureName.trim() || !signatureChecked) ? "not-allowed" : "pointer",
                fontFamily: FONT, marginBottom: 8,
              }}
            >
              {actionLoading ? "Procesando…" : "Aceptar y firmar"}
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              style={{ width: "100%", padding: "9px 0", background: "transparent", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}
            >
              Rechazar
            </button>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 380, width: "100%", fontFamily: FONT }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0B1F2A", margin: "0 0 8px" }}>Rechazar presupuesto</h3>
            <p style={{ fontSize: 13, color: "#7C8B96", margin: "0 0 14px" }}>Puedes indicar el motivo (opcional).</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="El precio es demasiado elevado…"
              rows={3}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E2E6EA", borderRadius: 7, fontSize: 13, resize: "vertical", boxSizing: "border-box", marginBottom: 14, fontFamily: FONT }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: "9px 16px", background: "transparent", border: "1px solid #E2E6EA", borderRadius: 7, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>
                Cancelar
              </button>
              <button onClick={handleReject} disabled={actionLoading} style={{ padding: "9px 16px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                {actionLoading ? "Enviando…" : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Móvil: apilar PDF y panel de firma para que la firma sea accesible */}
      <style>{`
        @media (max-width: 720px) {
          .docp-main { flex-direction: column !important; }
          .docp-panel {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid #E2E6EA !important;
            max-height: 46dvh;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  )
}

function StatusPage({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F2F5", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E6EA", padding: "44px 28px", maxWidth: 380, width: "100%", textAlign: "center" }}>
        {icon === "link-broken" && <Link2Off size={36} color="#7C8B96" style={{ margin: "0 auto 14px" }} />}
        {icon === "clock"       && <Clock    size={36} color="#F59E0B" style={{ margin: "0 auto 14px" }} />}
        {icon === "error"       && <XCircle  size={36} color="#DC2626" style={{ margin: "0 auto 14px" }} />}
        <h1 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: "#0B1F2A", margin: "0 0 8px" }}>{title}</h1>
        <p style={{ fontFamily: FONT, fontSize: 13, color: "#7C8B96", margin: 0 }}>{description}</p>
      </div>
    </div>
  )
}
