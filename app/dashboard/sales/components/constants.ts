"use client"

export type SaleStatus = "nueva" | "seguimiento" | "negociación" | "ganada" | "perdida"
export type SaleOrigin = "manual" | "automático"

export interface SaleRecord {
  id: string
  cliente: string
  producto: string
  importe: number
  canal: string
  comercial: string
  estado: SaleStatus
  fecha: string
  origen: SaleOrigin
  detalles: string
  notas: string[]
}

export const STATUS_LABELS: Record<SaleStatus, string> = {
  nueva: "Nueva",
  seguimiento: "Seguimiento",
  negociación: "Negociación",
  ganada: "Ganada",
  perdida: "Perdida",
}

export interface StatItem {
  id: string
  label: string
  value: string
  change?: string
  color?: string
  icon?: string
  hint?: string
}

/** Map DB status string to UI SaleStatus */
export function dbStatusToUiStatus(dbStatus: string): SaleStatus {
  const s = (dbStatus || "").toLowerCase()
  if (s === "ganada" || s === "pagado" || s === "closed" || s === "won") return "ganada"
  if (s === "perdida" || s === "lost" || s === "churn") return "perdida"
  if (s === "nueva" || s === "new") return "nueva"
  if (s === "negociación" || s === "negociacion") return "negociación"
  if (s === "seguimiento" || s === "follow-up") return "seguimiento"
  return "seguimiento"
}

/** Map UI SaleStatus to DB status string for API */
export function uiStatusToDbStatus(ui: SaleStatus): string {
  return ui
}

/** Shape returned by GET /api/sales (Prisma Sale) */
export interface ApiSale {
  id: string
  clientName: string
  clientEmail?: string | null
  product: string
  category?: string | null
  price: number
  total: number
  provider: string
  paymentMethod: string
  status: string
  notes?: string | null
  saleDate: string
}

/** Map API sale to UI SaleRecord */
export function mapApiSaleToRecord(sale: ApiSale): SaleRecord {
  const fecha = sale.saleDate ? sale.saleDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  const isManual = (sale.paymentMethod || sale.provider || "").toUpperCase() === "MANUAL"
  return {
    id: sale.id,
    cliente: sale.clientName || "—",
    producto: sale.product || "—",
    importe: Number(sale.total) || 0,
    canal: sale.category || sale.provider || "—",
    comercial: "—",
    estado: dbStatusToUiStatus(sale.status),
    fecha,
    origen: isManual ? "manual" : "automático",
    detalles: sale.notes || "—",
    notas: sale.notes ? sale.notes.split(/\n/).filter(Boolean) : [],
  }
}