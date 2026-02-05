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

export const MOCK_SALES: SaleRecord[] = [
  {
    id: "sale-01",
    cliente: "Luz & Asociados",
    producto: "CRM Enterprise",
    importe: 18200,
    canal: "Web",
    comercial: "Marcos",
    estado: "negociación",
    fecha: "2026-01-19",
    origen: "manual",
    detalles: "Demo estratégica con equipo directivo.",
    notas: ["Enviar contrato legal", "Revisar cláusula de soporte"],
  },
  {
    id: "sale-02",
    cliente: "Moderno Retail",
    producto: "Automatización de campañas",
    importe: 7200,
    canal: "Email Pro",
    comercial: "Lucía",
    estado: "seguimiento",
    fecha: "2026-01-18",
    origen: "automático",
    detalles: "Webhook Shopify detectó nuevo lead con alto ticket.",
    notas: ["Preparar propuesta económica", "Coordinar llamada final"],
  },
  {
    id: "sale-03",
    cliente: "Studio Fenix",
    producto: "Analytics Premium",
    importe: 13200,
    canal: "Inbound",
    comercial: "Andrés",
    estado: "ganada",
    fecha: "2026-01-15",
    origen: "manual",
    detalles: "Cliente renovó y añadió módulos IA.",
    notas: ["Emitir factura", "Agendar onboarding"],
  },
  {
    id: "sale-04",
    cliente: "Café Nimbus",
    producto: "Automatización de lead scoring",
    importe: 5400,
    canal: "Publicidad",
    comercial: "Marcos",
    estado: "nueva",
    fecha: "2026-01-20",
    origen: "automático",
    detalles: "Webhook Stripe detectó pago rechazado, se envió workflow.",
    notas: ["Responder con plantillas personalizadas"],
  },
  {
    id: "sale-05",
    cliente: "Orbit Finance",
    producto: "Consultoría CX",
    importe: 26400,
    canal: "Partner",
    comercial: "Andrés",
    estado: "ganada",
    fecha: "2026-01-10",
    origen: "manual",
    detalles: "Contrató paquete anual con onboarding acelerado.",
    notas: ["Enviar reporte mensual", "Coordinar success call"],
  },
  {
    id: "sale-06",
    cliente: "Nodespace Labs",
    producto: "Ecosistema API",
    importe: 9800,
    canal: "Demo",
    comercial: "Lucía",
    estado: "perdida",
    fecha: "2026-01-08",
    origen: "manual",
    detalles: "Rechazaron por presupuesto, etiquetado como churn potencial.",
    notas: ["Registrar motivo en CRM", "Programar reenganche en Q3"],
  },
]