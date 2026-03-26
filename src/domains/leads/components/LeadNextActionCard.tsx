"use client"

const ACTIONS = [
  { label: "Enviar email de bienvenida", deadline: "Hoy antes de las 18:00" },
  { label: "Llamar si no responde", deadline: "Mañana por la mañana" },
  { label: "Segundo seguimiento", deadline: "En 3 días" },
]

export function LeadNextActionCard({ leadId, leadStatus }: { leadId: string; leadStatus?: string }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", margin: "0 0 14px" }}>
        Siguiente acción
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ACTIONS.map((action, i) => (
          <div key={action.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--green-badge-bg)",
                color: "var(--green-badge-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {i + 1}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                {action.label}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                {action.deadline}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
