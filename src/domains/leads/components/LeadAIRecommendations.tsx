"use client"

import { Zap, UserCheck, Clock } from "lucide-react"

interface LeadAIRecommendationsProps {
  score: number
  phone: string | null
  leadStatus: string
}

interface Recommendation {
  iconBg: string
  icon: React.ReactNode
  title: string
  description: string
  action: string
}

export function LeadAIRecommendations({ score, phone, leadStatus }: LeadAIRecommendationsProps) {
  const recs: Recommendation[] = []

  if (score < 30) {
    recs.push({
      iconBg: "var(--amber-soft-bg)",
      icon: <Zap style={{ width: 16, height: 16, color: "#EF9F27" }} />,
      title: "Activa el interés",
      description: "Envía contenido de valor para aumentar el engagement.",
      action: "Enviar email →",
    })
  }

  if (!phone) {
    recs.push({
      iconBg: "var(--green-badge-bg)",
      icon: <UserCheck style={{ width: 16, height: 16, color: "var(--green-badge-text)" }} />,
      title: "Completa la ficha",
      description: "Añade el teléfono para mejorar el contacto directo.",
      action: "Editar lead →",
    })
  }

  recs.push({
    iconBg: "var(--blue-soft-bg)",
    icon: <Clock style={{ width: 16, height: 16, color: "#378ADD" }} />,
    title: "Contacta hoy",
    description: "Los leads nuevos tienen 3x más conversión en las primeras 24h.",
    action: "Hacer esto →",
  })

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", margin: "0 0 14px" }}>
        Recomendaciones IA
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recs.map((rec) => (
          <div
            key={rec.title}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "12px",
              border: "0.5px solid var(--border-subtle)",
              borderRadius: 8,
              background: "var(--bg-surface)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: rec.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {rec.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 2px" }}>
                {rec.title}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 6px" }}>
                {rec.description}
              </p>
              <button
                type="button"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--green-btn)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {rec.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
