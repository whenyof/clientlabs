"use client"

type HaciendaStatus = "pending" | "sent" | "accepted" | "rejected"

export function SendToHaciendaButton({ invoiceId, status }: { invoiceId: string; status: HaciendaStatus }) {
  if (status === "sent" || status === "accepted" || status === "rejected") {
    return <span className="text-xs text-white/60">{status === "accepted" ? "Enviado" : status === "rejected" ? "Rechazado" : "Enviado"}</span>
  }
  return (
    <button type="button" className="text-xs text-emerald-400 hover:underline" aria-label={`Enviar factura ${invoiceId} a Hacienda`}>
      Enviar
    </button>
  )
}
