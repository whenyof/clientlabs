"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Video, Phone, Mail, FileText, Plus, Clock, User,
  Building2, ExternalLink, Save, ChevronRight, X, ArrowLeft
} from "lucide-react"

interface MeetingTask {
  id: string
  title: string
  description: string | null
  meetingUrl: string | null
  meetingType: string | null
  meetingNotes: string | null
  clientId: string | null
  leadId: string | null
  project: { id: string; name: string; color: string } | null
}

interface Contact {
  id: string
  name: string | null
  role: string | null
  email: string | null
  phone: string | null
  isPrimary: boolean
}

interface Activity {
  id: string
  title: string
  description: string | null
  createdAt: string
  type: string
}

interface Invoice {
  id: string
  number: string | null
  total: unknown
  status: string
}

interface Quote {
  id: string
  number: string | null
  total: unknown
}

type EntityData = Record<string, unknown>

interface MeetingViewProps {
  task: MeetingTask
  entityData: EntityData | null
  entityType: "client" | "lead" | null
}

function getMeetingMeta(url: string | null) {
  if (!url) return { label: "Videollamada", color: "#94A3B8", dot: "#94A3B8" }
  if (url.includes("meet.google")) return { label: "Google Meet", color: "#0F766E", dot: "#0F766E" }
  if (url.includes("zoom")) return { label: "Zoom", color: "#2D8CFF", dot: "#2D8CFF" }
  if (url.includes("teams")) return { label: "Microsoft Teams", color: "#7B5EA7", dot: "#7B5EA7" }
  return { label: "Videollamada", color: "#64748B", dot: "#64748B" }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`
}

export function MeetingView({ task, entityData, entityType }: MeetingViewProps) {
  const [notes, setNotes] = useState(task.meetingNotes ?? "")
  const [savedNotes, setSavedNotes] = useState(task.meetingNotes ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const meta = getMeetingMeta(task.meetingUrl)

  const saveNotes = useCallback(async (forceSave = false) => {
    if (!forceSave && notes === savedNotes) return
    setIsSaving(true)
    try {
      await fetch(`/api/meeting/${task.id}/save-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      setSavedNotes(notes)
      setLastSaved(new Date())
    } catch {
      // silent — will retry in 5s
    } finally {
      setIsSaving(false)
    }
  }, [notes, savedNotes, task.id])

  // Auto-save cada 30 segundos (mínimo permitido de polling; beforeunload cubre salidas)
  useEffect(() => {
    const t = setInterval(() => saveNotes(), 30_000)
    return () => clearInterval(t)
  }, [saveNotes])

  // Guardar al salir de la página
  useEffect(() => {
    const handler = () => { if (notes !== savedNotes) saveNotes(true) }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [notes, savedNotes, saveNotes])

  // Timer duración
  useEffect(() => {
    if (!meetingStarted) return
    const t = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    return () => clearInterval(t)
  }, [meetingStarted])

  function openMeeting() {
    if (!task.meetingUrl) return
    const w = Math.floor(screen.width * 0.55)
    window.open(task.meetingUrl, "clientlabs-meeting", `width=${w},height=${screen.height},left=0,top=0`)
    setMeetingStarted(true)
  }

  const entity = entityData as {
    id?: string
    name?: string
    email?: string
    phone?: string
    city?: string
    country?: string
    company?: string
    companyName?: string
    score?: number
    estimatedValue?: number
    totalSpent?: number
    contacts?: Contact[]
    activities?: Activity[]
    invoices?: Invoice[]
    quotes?: Quote[]
  } | null

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/dashboard/tasks" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", color: "#64748B", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
          </a>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Video style={{ width: 15, height: 15, color: meta.color }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", margin: 0, lineHeight: 1.2 }}>{task.title}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>
              <span style={{ color: meta.color }}>{meta.label}</span>
              {task.project && <span style={{ marginLeft: 8 }}>· {task.project.name}</span>}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {meetingStarted && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: "#FEF2F2", color: "#EF4444", fontSize: 12, fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              {formatTime(elapsedTime)}
            </div>
          )}
          {isSaving && <span style={{ fontSize: 11, color: "#94A3B8" }}>Guardando...</span>}
          {lastSaved && !isSaving && <span style={{ fontSize: 11, color: "#94A3B8" }}>Guardado ✓</span>}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* PANEL IZQUIERDO */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>

          {/* Botón unirse */}
          {!meetingStarted ? (
            <div style={{ textAlign: "center", paddingTop: 40, paddingBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Video style={{ width: 32, height: 32, color: meta.color }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>Listo para la reunión</h2>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 24px" }}>
                {entity?.name ? `Reunión con ${entity.name}` : task.title}
              </p>
              <button
                onClick={openMeeting}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10, background: meta.color, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 4px 14px ${meta.color}40` }}
              >
                <Video style={{ width: 18, height: 18 }} />
                Unirse a la reunión
              </button>
              <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 10 }}>Se abrirá {meta.label} en una ventana nueva</p>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#15803D" }}>Reunión en curso — {formatTime(elapsedTime)}</span>
              </div>
              <button onClick={openMeeting} style={{ fontSize: 11, color: "#16A34A", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                Volver a la ventana <ExternalLink style={{ width: 10, height: 10 }} />
              </button>
            </div>
          )}

          {/* Notas */}
          <div style={{ marginTop: meetingStarted ? 0 : 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>Notas de la reunión</h3>
              <button
                onClick={() => saveNotes(true)}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#0F766E", background: "none", border: "none", cursor: "pointer" }}
              >
                <Save style={{ width: 11, height: 11 }} /> Guardar ahora
              </button>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escribe aquí las notas de la reunión... Se guardan automáticamente cada 5 segundos."
              style={{
                width: "100%", minHeight: 280, borderRadius: 10, border: "1px solid #E2E8F0",
                padding: "14px 16px", fontSize: 13, color: "#334155", resize: "vertical",
                outline: "none", fontFamily: "inherit", lineHeight: 1.6, background: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Acciones rápidas */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", marginBottom: 10 }}>Acciones rápidas</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: FileText, label: "Crear presupuesto", color: "#3B82F6", href: "/dashboard/finance/presupuestos" },
                { icon: Plus, label: "Crear tarea", color: "#0F766E", href: "/dashboard/tasks" },
                { icon: Mail, label: "Enviar email", color: "#F59E0B", href: entity?.email ? `mailto:${entity.email}` : undefined },
                { icon: Phone, label: "Registrar llamada", color: "#8B5CF6", href: entity?.phone ? `tel:${entity.phone}` : undefined },
              ].map(({ icon: Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href ?? "#"}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", textDecoration: "none", transition: "background 0.1s" }}
                >
                  <Icon style={{ width: 13, height: 13, color }} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO — Info contacto */}
        <div style={{ width: 360, background: "#fff", borderLeft: "1px solid #E2E8F0", overflowY: "auto", flexShrink: 0 }}>
          {entity ? (
            <div style={{ padding: 20 }}>

              {/* Avatar + nombre */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#E8F5EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#0F766E", flexShrink: 0 }}>
                  {String(entity.name ?? "??").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0 }}>{String(entity.name ?? "")}</p>
                  {(entity.company || entity.companyName) && (
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>{String(entity.company ?? entity.companyName ?? "")}</p>
                  )}
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: "#E8F5EF", color: "#0F766E", fontWeight: 600 }}>
                    {entityType === "client" ? "Cliente" : "Lead"}
                  </span>
                </div>
              </div>

              {/* Datos de contacto */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                {entity.email && (
                  <a href={`mailto:${entity.email}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", textDecoration: "none" }}>
                    <Mail style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                    {String(entity.email)}
                  </a>
                )}
                {entity.phone && (
                  <a href={`tel:${entity.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569", textDecoration: "none" }}>
                    <Phone style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                    {String(entity.phone)}
                  </a>
                )}
                {entity.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
                    <Building2 style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                    {String(entity.city)}{entity.country ? `, ${entity.country}` : ""}
                  </div>
                )}
                {entityType === "lead" && entity.score != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
                    <Clock style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                    Score: <strong>{String(entity.score)}/100</strong>
                    {entity.estimatedValue ? ` · ${Number(entity.estimatedValue).toLocaleString("es-ES")}€ est.` : ""}
                  </div>
                )}
                {entityType === "client" && entity.totalSpent != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
                    <FileText style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                    Total facturado: <strong>{Number(entity.totalSpent).toLocaleString("es-ES")}€</strong>
                  </div>
                )}
              </div>

              {/* Contactos (lead) */}
              {entityType === "lead" && Array.isArray(entity.contacts) && entity.contacts.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <SectionTitle>Contactos</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(entity.contacts as Contact[]).map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: "#F8FAFC", fontSize: 11 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#64748B", flexShrink: 0 }}>
                          {(c.name ?? "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.name} {c.isPrimary && "★"}
                          </p>
                          <p style={{ color: "#94A3B8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.role}{c.role && (c.email || c.phone) ? " · " : ""}{c.email ?? c.phone ?? ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facturas pendientes (cliente) */}
              {entityType === "client" && Array.isArray(entity.invoices) && entity.invoices.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <SectionTitle>Facturas pendientes ({entity.invoices.length})</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {(entity.invoices as Invoice[]).map(inv => (
                      <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 7, background: "#F8FAFC", fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>{inv.number ?? "—"}</span>
                        <span style={{ fontWeight: 700, color: inv.status === "OVERDUE" ? "#EF4444" : "#F59E0B" }}>
                          {Number(inv.total).toLocaleString("es-ES")}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Presupuestos abiertos (cliente) */}
              {entityType === "client" && Array.isArray(entity.quotes) && entity.quotes.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <SectionTitle>Presupuestos abiertos ({entity.quotes.length})</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {(entity.quotes as Quote[]).map(q => (
                      <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 7, background: "#F8FAFC", fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>{q.number ?? "—"}</span>
                        <span style={{ color: "#64748B" }}>{Number(q.total).toLocaleString("es-ES")}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actividad reciente (lead) */}
              {entityType === "lead" && Array.isArray(entity.activities) && entity.activities.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <SectionTitle>Actividad reciente</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(entity.activities as Activity[]).map(act => (
                      <div key={act.id} style={{ display: "flex", gap: 8, fontSize: 11 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#CBD5E1", marginTop: 4, flexShrink: 0 }} />
                        <div>
                          <p style={{ color: "#475569", margin: 0 }}>{act.title || act.description}</p>
                          <p style={{ color: "#CBD5E1", margin: 0, fontSize: 10 }}>
                            {new Date(act.createdAt).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link ficha completa */}
              <a
                href={entityType === "client" ? `/dashboard/clients/${entity.id}` : `/dashboard/leads/${entity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px 0", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, fontWeight: 600, color: "#475569", textDecoration: "none" }}
              >
                Ver ficha completa <ChevronRight style={{ width: 12, height: 12 }} />
              </a>
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: "center", marginTop: 48 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <User style={{ width: 20, height: 20, color: "#CBD5E1" }} />
              </div>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Sin cliente o lead vinculado</p>
              <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 6 }}>Vincula esta tarea a un cliente o lead para ver su información aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#94A3B8", textTransform: "uppercase", marginBottom: 8, marginTop: 0 }}>
      {children}
    </p>
  )
}
