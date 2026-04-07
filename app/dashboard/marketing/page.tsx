import { Megaphone } from "lucide-react"

export default function MarketingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", padding: 32 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 48 }}>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "#8B5CF615", border: "0.5px solid #8B5CF630",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <Megaphone style={{ width: 26, height: 26, color: "#8B5CF6" }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Marketing
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 32px", lineHeight: 1.6 }}>
          Crea y gestiona campañas de email marketing, secuencias automatizadas y segmentación de leads. Esta sección está en construcción.
        </p>

        {/* Upcoming features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Campañas de email", desc: "Envía emails masivos segmentados a tus leads y clientes" },
            { label: "Secuencias automatizadas", desc: "Flujos de email en cadena activados por comportamiento" },
            { label: "Segmentación de audiencias", desc: "Crea grupos de leads por score, estado y fuente" },
            { label: "Analíticas de apertura", desc: "Tasa de apertura, clics y conversiones por campaña" },
          ].map((f) => (
            <div key={f.label} style={{
              padding: "14px 16px",
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-subtle)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{f.label}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>{f.desc}</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                padding: "3px 8px", borderRadius: 5,
                background: "var(--bg-surface)",
                border: "0.5px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}>
                Próximamente
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
