"use client"

import { useState, useEffect } from "react"
import { X, Copy, Check, ExternalLink, RefreshCw } from "lucide-react"

interface CalendarData {
  feedUrl: string
  googleCalendarUrl: string
  appleCalendarUrl: string
  outlookUrl: string
}

interface Props {
  onClose: () => void
}

const CALENDAR_OPTIONS = [
  {
    key: "google" as const,
    label: "Google Calendar",
    note: "⚠️ Puede tardar hasta 24 horas en actualizarse",
    noteColor: "#D97706",
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="40" height="38" rx="4" fill="#4285F4"/>
        <rect x="4" y="6" width="40" height="13" rx="4" fill="#1967D2"/>
        <rect x="4" y="13" width="40" height="6" fill="#1967D2"/>
        <text x="24" y="36" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">31</text>
      </svg>
    ),
  },
  {
    key: "apple" as const,
    label: "Apple Calendar",
    note: "✓ Se actualiza cada 15 minutos",
    noteColor: "#059669",
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="40" height="38" rx="4" fill="#FF3B30"/>
        <rect x="4" y="6" width="40" height="13" rx="4" fill="#C62828"/>
        <rect x="4" y="13" width="40" height="6" fill="#C62828"/>
        <text x="24" y="36" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">31</text>
      </svg>
    ),
  },
  {
    key: "outlook" as const,
    label: "Outlook Calendar",
    note: "Se actualiza cada 3 horas",
    noteColor: "#64748b",
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="40" height="38" rx="4" fill="#0078D4"/>
        <text x="24" y="33" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">O</text>
      </svg>
    ),
  },
]

export function ConnectCalendarModal({ onClose }: Props) {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetch("/api/calendar/token")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleCopy = () => {
    if (!data) return
    navigator.clipboard.writeText(data.feedUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRegenerate = async () => {
    if (!confirm("¿Regenerar el enlace? El enlace anterior dejará de funcionar.")) return
    setRegenerating(true)
    try {
      const r = await fetch("/api/calendar/token", { method: "POST" })
      const d = await r.json()
      setData(d)
    } finally {
      setRegenerating(false)
    }
  }

  const getHref = (key: "google" | "apple" | "outlook") => {
    if (!data) return "#"
    if (key === "google") return data.googleCalendarUrl
    if (key === "apple") return data.appleCalendarUrl
    return data.outlookUrl
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 0" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0B1F2A", margin: 0 }}>Conectar calendario</h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0", lineHeight: 1.4 }}>
              Tus tareas con fecha aparecerán como eventos. Solo lectura — los cambios se hacen en ClientLabs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: 6, borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", flexShrink: 0, display: "flex" }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>Generando enlace…</div>
          ) : !data ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#ef4444", fontSize: 13 }}>Error al cargar. Inténtalo de nuevo.</div>
          ) : (
            <>
              {/* Calendar buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CALENDAR_OPTIONS.map(({ key, label, note, noteColor, icon }) => (
                  <a
                    key={key}
                    href={getHref(key)}
                    target={key !== "apple" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 10, border: "1px solid #e2e8f0", textDecoration: "none",
                      transition: "border-color 0.15s, background 0.15s",
                      cursor: "pointer", background: "white",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1FA97A"; (e.currentTarget as HTMLElement).style.background = "#f0fdf9" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "white" }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</div>
                      <div style={{ fontSize: 11, color: noteColor, marginTop: 1 }}>{note}</div>
                    </div>
                    <ExternalLink style={{ width: 14, height: 14, color: "#cbd5e1", flexShrink: 0 }} />
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>O copia el enlace manualmente</span>
                <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              </div>

              {/* Manual copy */}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  readOnly
                  value={data.feedUrl}
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0",
                    background: "#f8fafc", fontSize: 11, color: "#475569",
                    outline: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "8px 12px",
                    borderRadius: 7, border: "none", background: copied ? "#059669" : "#1FA97A",
                    color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", margin: "8px 0 0" }}>
                Compatible con cualquier app que soporte suscripciones iCal
              </p>

              {/* Regenerate */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#94a3b8", padding: 0 }}
                >
                  <RefreshCw style={{ width: 11, height: 11 }} />
                  {regenerating ? "Regenerando…" : "Regenerar enlace (invalida el anterior)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
