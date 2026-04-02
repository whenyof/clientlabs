"use client"

import { useState, useEffect } from "react"
import { Loader2, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { formatTimeAgo } from "@domains/leads/utils/formatting"

interface LeadEmailModuleProps {
  leadId: string
  leadEmail: string | null
  leadName: string | null
}

type Tab = "suggestions" | "compose" | "sent"

interface SentEmail {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
}

const SUGGESTIONS = [
  {
    type: "Bienvenida",
    title: "Email de bienvenida",
    description: "Primer contacto amigable y presentación",
    subject: "Bienvenido — estamos aquí para ayudarte",
    message: "Hola,\n\nGracias por contactar con nosotros. Nos alegra tenerte aquí.\n\nNos gustaría conocer mejor tus necesidades para poder ayudarte de la mejor manera posible. ¿Tienes unos minutos esta semana para una breve llamada?\n\nQuedamos a tu disposición.\n\nUn saludo",
  },
  {
    type: "Seguimiento",
    title: "Email de seguimiento",
    description: "Recordatorio después del primer contacto",
    subject: "¿Pudiste revisar lo que te enviamos?",
    message: "Hola,\n\nQuería hacer un seguimiento de nuestra conversación anterior. ¿Has tenido oportunidad de revisar la información que te compartimos?\n\nEstoy disponible si tienes alguna pregunta o si prefieres agendar una llamada.\n\nUn saludo",
  },
  {
    type: "Oferta",
    title: "Presentación de oferta",
    description: "Propuesta personalizada para el lead",
    subject: "Tenemos algo especial para ti",
    message: "Hola,\n\nDespués de conocer mejor tu situación, hemos preparado una propuesta que creemos que encaja perfectamente con tus necesidades.\n\n¿Te gustaría que la revisáramos juntos? Puedo adaptarla a lo que necesites.\n\nQuedo a tu disposición.\n\nUn saludo",
  },
  {
    type: "Recordatorio",
    title: "Recordatorio suave",
    description: "Reactivar un lead sin respuesta",
    subject: "Solo quería asegurarme de que lo recibiste",
    message: "Hola,\n\nSolo quería asegurarme de que recibiste mi mensaje anterior. Entiendo que estás ocupado, así que no te entretengo.\n\nSi en algún momento quieres retomar la conversación, estaré encantado de ayudarte.\n\nUn saludo",
  },
]

const AI_ACTIONS = [
  { key: "improve", label: "Mejorar con IA" },
  { key: "shorter", label: "Hacer más corto" },
  { key: "tone", label: "Cambiar tono" },
] as const

export function LeadEmailModule({ leadId, leadEmail, leadName }: LeadEmailModuleProps) {
  const [activeTab, setActiveTab] = useState<Tab>("suggestions")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [sentLoading, setSentLoading] = useState(false)

  useEffect(() => {
    if (activeTab === "sent") {
      setSentLoading(true)
      fetch(`/api/leads/${leadId}/activity`)
        .then((r) => r.json())
        .then((data: SentEmail[]) => {
          setSentEmails((Array.isArray(data) ? data : []).filter((a) => a.type === "EMAIL"))
        })
        .catch(() => setSentEmails([]))
        .finally(() => setSentLoading(false))
    }
  }, [activeTab, leadId])

  const handleSuggestionClick = (s: (typeof SUGGESTIONS)[number]) => {
    setSubject(s.subject)
    setMessage(s.message)
    setActiveTab("compose")
  }

  const handleAI = async (action: "improve" | "shorter" | "tone") => {
    if (!message.trim() || aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai/email-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, action }),
      })
      if (!res.ok) throw new Error("AI error")
      const data = await res.json()
      if (data.subject) setSubject(data.subject)
      if (data.message) setMessage(data.message)
    } catch {
      // silently fail — user keeps original text
    } finally {
      setAiLoading(false)
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim() || sendLoading) return
    setSendLoading(true)
    try {
      await fetch(`/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "EMAIL", title: subject, description: message }),
      })
      setSubject("")
      setMessage("")
      setActiveTab("sent")
    } finally {
      setSendLoading(false)
    }
  }

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "8px 4px",
    fontSize: 13,
    fontWeight: 500,
    background: "none",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid var(--green-btn)" : "2px solid transparent",
    color: activeTab === tab ? "var(--green-btn)" : "var(--text-secondary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  })

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "0 20px",
          borderBottom: "0.5px solid var(--border-subtle)",
        }}
      >
        <button type="button" style={tabStyle("suggestions")} onClick={() => setActiveTab("suggestions")}>
          Sugerencias IA
        </button>
        <button type="button" style={tabStyle("compose")} onClick={() => setActiveTab("compose")}>
          Redactar
        </button>
        <button type="button" style={tabStyle("sent")} onClick={() => setActiveTab("sent")}>
          Enviados
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {/* SUGGESTIONS TAB */}
        {activeTab === "suggestions" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    textAlign: "left",
                    background: "var(--bg-card)",
                    border: "0.5px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: 14,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget
                    t.style.borderColor = "var(--green-btn)"
                    t.style.background = "var(--green-badge-bg)"
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget
                    t.style.borderColor = "var(--border-subtle)"
                    t.style.background = "var(--bg-card)"
                  }}
                >
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--green-btn)", margin: 0, fontWeight: 600 }}>
                    {s.type}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "4px 0 4px" }}>
                    {s.title}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    {s.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Compose area also visible in suggestions tab */}
            <ComposeArea
              subject={subject}
              message={message}
              onSubjectChange={setSubject}
              onMessageChange={setMessage}
              aiLoading={aiLoading}
              sendLoading={sendLoading}
              onAI={handleAI}
              onSend={handleSend}
            />
          </>
        )}

        {/* COMPOSE TAB */}
        {activeTab === "compose" && (
          <ComposeArea
            subject={subject}
            message={message}
            onSubjectChange={setSubject}
            onMessageChange={setMessage}
            aiLoading={aiLoading}
            sendLoading={sendLoading}
            onAI={handleAI}
            onSend={handleSend}
          />
        )}

        {/* SENT TAB */}
        {activeTab === "sent" && (
          <div>
            {sentLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Loader2 style={{ width: 20, height: 20, color: "var(--text-secondary)" }} className="animate-spin" />
              </div>
            ) : sentEmails.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: "32px 0", fontStyle: "italic" }}>
                Aún no has enviado ningún email a este lead.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {sentEmails.map((email) => (
                  <li
                    key={email.id}
                    style={{
                      padding: 12,
                      background: "var(--bg-surface)",
                      border: "0.5px solid var(--border-subtle)",
                      borderRadius: 8,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                      {email.title}
                    </p>
                    {email.description && (
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email.description}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "6px 0 0" }}>
                      {formatTimeAgo(email.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface ComposeAreaProps {
  subject: string
  message: string
  onSubjectChange: (v: string) => void
  onMessageChange: (v: string) => void
  aiLoading: boolean
  sendLoading: boolean
  onAI: (action: "improve" | "shorter" | "tone") => void
  onSend: () => void
}

function ComposeArea({ subject, message, onSubjectChange, onMessageChange, aiLoading, sendLoading, onAI, onSend }: ComposeAreaProps) {
  const AI_ACTIONS = [
    { key: "improve" as const, label: "Mejorar con IA" },
    { key: "shorter" as const, label: "Hacer más corto" },
    { key: "tone" as const, label: "Cambiar tono" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        type="text"
        placeholder="Asunto"
        value={subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          fontSize: 13,
          borderRadius: 8,
          border: "0.5px solid var(--border-subtle)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <Textarea
        placeholder="Escribe tu mensaje..."
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        rows={4}
        style={{ resize: "none", fontSize: 13 }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {AI_ACTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => onAI(a.key)}
              disabled={aiLoading || !message.trim()}
              style={{
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 8,
                border: "0.5px solid var(--green-badge-border)",
                background: "var(--green-badge-bg)",
                color: "var(--green-badge-text)",
                cursor: aiLoading || !message.trim() ? "not-allowed" : "pointer",
                opacity: aiLoading || !message.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 500,
              }}
            >
              {aiLoading ? <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" /> : null}
              {a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={sendLoading || !subject.trim() || !message.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 8,
            border: "none",
            background: "var(--green-btn)",
            color: "#fff",
            cursor: sendLoading || !subject.trim() || !message.trim() ? "not-allowed" : "pointer",
            opacity: sendLoading || !subject.trim() || !message.trim() ? 0.5 : 1,
          }}
        >
          {sendLoading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Send style={{ width: 14, height: 14 }} />}
          Enviar
        </button>
      </div>
    </div>
  )
}
