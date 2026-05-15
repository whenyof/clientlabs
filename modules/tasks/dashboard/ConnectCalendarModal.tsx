"use client"

import { useState, useEffect } from "react"
import { X, ArrowLeft, ChevronRight, RefreshCw } from "lucide-react"

type CalendarApp = "google" | "apple" | "outlook"
type Step = "choose" | CalendarApp | "connected"

interface CalendarData { googleCalendarUrl: string; appleCalendarUrl: string; outlookUrl: string }
interface Props { onClose: () => void }

const GIcon = () => <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="38" rx="4" fill="#4285F4"/><rect x="4" y="6" width="40" height="13" rx="4" fill="#1967D2"/><rect x="4" y="13" width="40" height="6" fill="#1967D2"/><text x="24" y="36" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">31</text></svg>
const AIcon = () => <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="38" rx="4" fill="#FF3B30"/><rect x="4" y="6" width="40" height="13" rx="4" fill="#C62828"/><rect x="4" y="13" width="40" height="6" fill="#C62828"/><text x="24" y="36" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">31</text></svg>
const OIcon = () => <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="38" rx="4" fill="#0078D4"/><text x="24" y="33" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">O</text></svg>

const APPS: { key: CalendarApp; label: string; updateLabel: string; updateNote: string; steps: string[]; iconBg: string; icon: React.ReactNode }[] = [
  {
    key: "google", label: "Google Calendar", updateLabel: "Actualiza periódicamente", updateNote: "Puede tardar hasta 24 h en sincronizar",
    steps: ["Pulsa \"Abrir en Google Calendar\" abajo", "Google pedirá confirmación — acepta", "Las tareas aparecerán en \"Otros calendarios\""],
    iconBg: "#EBF2FF", icon: <GIcon />,
  },
  {
    key: "apple", label: "Apple Calendar", updateLabel: "Actualiza cada 15 min", updateNote: "Sincronización frecuente cada 15 minutos",
    steps: ["Pulsa \"Abrir en Apple Calendar\" abajo", "La app Calendario pedirá confirmación — acepta", "Las tareas aparecerán como un calendario nuevo"],
    iconBg: "#FFF0EF", icon: <AIcon />,
  },
  {
    key: "outlook", label: "Outlook Calendar", updateLabel: "Actualiza cada 3 horas", updateNote: "Sincronización cada 3 horas",
    steps: ["Pulsa \"Abrir en Outlook\" abajo", "Outlook Web abrirá — haz clic en \"Importar\"", "Las tareas aparecerán en \"Otros calendarios\""],
    iconBg: "#E8F3FC", icon: <OIcon />,
  },
]

const SYNCED_ITEMS = [
  "Tareas con fecha límite",
  "Prefijo [Proyecto] en el título",
  "Tareas completadas aparecen tachadas",
  "Solo lectura — los cambios se hacen en ClientLabs",
]

export function ConnectCalendarModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>("choose")
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetch("/api/calendar/token", { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const getHref = (app: CalendarApp) => {
    if (!data) return "#"
    return app === "google" ? data.googleCalendarUrl : app === "apple" ? data.appleCalendarUrl : data.outlookUrl
  }

  const handleRegenerate = async () => {
    if (!confirm("¿Regenerar el enlace? El anterior dejará de funcionar.")) return
    setRegenerating(true)
    try {
      const r = await fetch("/api/calendar/token", { method: "POST", credentials: "include" })
      setData(await r.json())
    } finally { setRegenerating(false) }
  }

  const currentApp = APPS.find((a) => a.key === step)
  const isAppStep = step === "google" || step === "apple" || step === "outlook"

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 16px 0" }}>
          {isAppStep && (
            <button type="button" onClick={() => setStep("choose")} style={{ padding: 4, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", flexShrink: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
          )}
          <h2 style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#0B1F2A", margin: 0 }}>
            {step === "choose" ? "Conectar calendario" : step === "connected" ? "Calendario añadido" : currentApp?.label}
          </h2>
          <button type="button" onClick={onClose} style={{ padding: 4, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", flexShrink: 0 }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#94a3b8", fontSize: 13 }}>Cargando…</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <p style={{ fontSize: 13, color: "#ef4444", margin: "0 0 10px" }}>Error al cargar. Inténtalo de nuevo.</p>
              <button type="button" onClick={() => window.location.reload()} style={{ fontSize: 12, color: "#1FA97A", background: "none", border: "none", cursor: "pointer" }}>
                Recargar página
              </button>
            </div>
          ) : step === "choose" ? (
            /* Step 1 – choose app */
            <div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>
                Elige tu app de calendario. Tus tareas con fecha aparecerán como eventos.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {APPS.map((a) => (
                  <button key={a.key} type="button" onClick={() => setStep(a.key)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", textAlign: "left", width: "100%" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1FA97A"; (e.currentTarget as HTMLElement).style.background = "#f0fdf9" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "white" }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: a.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{a.updateLabel}</div>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: "#cbd5e1" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : step === "connected" ? (
            /* Step 3 – confirmation */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f0fdf9", border: "1.5px solid #1FA97A", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 14px" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#1FA97A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 14px" }}>Calendario añadido correctamente</p>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", textAlign: "left", marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Qué se sincroniza</p>
                {SYNCED_ITEMS.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1FA97A", flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={onClose} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#1FA97A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Listo
              </button>
              <button type="button" onClick={handleRegenerate} disabled={regenerating}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#94a3b8", padding: "10px 0 0", margin: "0 auto" }}>
                <RefreshCw style={{ width: 10, height: 10 }} />
                {regenerating ? "Regenerando…" : "Regenerar enlace (invalida el anterior)"}
              </button>
            </div>
          ) : currentApp ? (
            /* Step 2 – tutorial */
            <div>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 14px", lineHeight: 1.4 }}>
                Sigue estos pasos para añadirlo a {currentApp.label}:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {currentApp.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#64748b" }}>{i + 1}</div>
                    <p style={{ fontSize: 12, color: "#334155", margin: 0, lineHeight: 1.5, paddingTop: 3 }}>{s}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 12px", marginBottom: 14 }}>
                <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.4 }}>
                  {currentApp.updateNote}. Solo lectura — los cambios se hacen en ClientLabs.
                </p>
              </div>
              <a
                href={getHref(step as CalendarApp)}
                target={step !== "apple" ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => setTimeout(() => setStep("connected"), 400)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 8, background: "#1FA97A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                Abrir en {currentApp.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
