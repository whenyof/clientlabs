import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ClientLabs — Gestión para autónomos y pymes en España"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d1a17",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: "#2d9b83", marginBottom: 20 }}>
          ClientLabs
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Gestión todo en uno para autónomos y pymes en España
        </div>
        <div style={{ fontSize: 20, color: "#7ab8ae", marginTop: 30 }}>
          Leads · Clientes · Facturas · Automatizaciones
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#2d9b83",
            marginTop: 20,
            background: "rgba(45,155,131,0.15)",
            padding: "10px 24px",
            borderRadius: 8,
          }}
        >
          Prueba gratis 14 días · clientlabs.io
        </div>
      </div>
    ),
    { ...size }
  )
}
