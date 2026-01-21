"use client"

export type ClientStatus = "active" | "vip" | "risk" | "churn"

export interface ClientItem {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: ClientStatus
  mrr: number
  lastContact: string
  owner: string
  createdAt: string
}

export interface ClientTimelineItem {
  id: string
  title: string
  detail: string
  time: string
}

export const CLIENTS: ClientItem[] = [
  {
    id: "c-1",
    name: "Camila Ruiz",
    company: "NovaHealth",
    email: "camila@novahealth.com",
    phone: "+34 611 223 344",
    status: "vip",
    mrr: 1200,
    lastContact: "Hoy",
    owner: "Marcos Silva",
    createdAt: "2025-12-14",
  },
  {
    id: "c-2",
    name: "Diego Santos",
    company: "Pixel Studio",
    email: "diego@pixelstudio.com",
    phone: "+34 622 410 210",
    status: "active",
    mrr: 480,
    lastContact: "Ayer",
    owner: "Lucía Ramos",
    createdAt: "2025-11-04",
  },
  {
    id: "c-3",
    name: "Laura Gómez",
    company: "Retailia",
    email: "laura@retailia.com",
    phone: "+34 699 887 101",
    status: "risk",
    mrr: 320,
    lastContact: "Hace 8 días",
    owner: "Andrés Vera",
    createdAt: "2025-10-19",
  },
  {
    id: "c-4",
    name: "Martín Pérez",
    company: "LegalPro",
    email: "martin@legalpro.com",
    phone: "+34 644 210 987",
    status: "active",
    mrr: 640,
    lastContact: "Hace 3 días",
    owner: "Lucía Ramos",
    createdAt: "2025-09-12",
  },
  {
    id: "c-5",
    name: "Sofía Vega",
    company: "EventsLab",
    email: "sofia@eventslab.io",
    phone: "+34 600 112 233",
    status: "churn",
    mrr: 0,
    lastContact: "Hace 2 semanas",
    owner: "Andrés Vera",
    createdAt: "2025-07-21",
  },
]

export const TIMELINE: ClientTimelineItem[] = [
  {
    id: "t-1",
    title: "Renovación mensual",
    detail: "Factura pagada sin incidencias.",
    time: "Hoy · 10:20",
  },
  {
    id: "t-2",
    title: "Reunión QBR",
    detail: "Se presentaron nuevas oportunidades de upsell.",
    time: "Hace 4 días · 16:00",
  },
  {
    id: "t-3",
    title: "Cliente incorporado",
    detail: "Onboarding completado con éxito.",
    time: "Hace 2 meses · 09:15",
  },
]
