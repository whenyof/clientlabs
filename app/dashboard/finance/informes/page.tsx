"use client"

import { BarChart3, FileDown, Calendar } from "lucide-react"

export default function InformesPage() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Informes fiscales
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Resúmenes de IVA, retenciones y totales por período
        </p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32,
      }}>
        {[
          { label: "Libro de IVA (trimestral)", icon: BarChart3, desc: "IVA repercutido y soportado" },
          { label: "Modelo 303", icon: FileDown, desc: "Autoliquidación IVA trimestral" },
          { label: "Informe anual", icon: Calendar, desc: "Resumen de ingresos y gastos" },
        ].map(({ label, icon: Icon, desc }) => (
          <div
            key={label}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
              borderRadius: 12, padding: 20, cursor: "pointer",
              transition: "box-shadow 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#1FA97A18", display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <Icon style={{ width: 18, height: 18, color: "#1FA97A" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: 12, padding: 40, textAlign: "center",
      }}>
        <BarChart3 style={{ width: 32, height: 32, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>
          Próximamente
        </p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Los informes fiscales automáticos estarán disponibles en breve
        </p>
      </div>
    </div>
  )
}
