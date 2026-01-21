"use client"

export type LeadStatus = "hot" | "warm" | "cold"

export type LeadSource = "Web" | "Ads" | "Referral" | "Partner" | "Outbound"

export interface LeadItem {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: LeadSource
  status: LeadStatus
  lastContact: string
  aiScore: number
  owner: string
  budget: number
}

export interface TimelineItem {
  id: string
  title: string
  detail: string
  time: string
}

export interface AutomationItem {
  id: string
  name: string
  description: string
  active: boolean
}

export const LEADS: LeadItem[] = [
  {
    id: "lead-1",
    name: "Camila Ruiz",
    company: "NovaHealth",
    email: "camila@novahealth.com",
    phone: "+34 611 223 344",
    source: "Ads",
    status: "hot",
    lastContact: "Hace 2 horas",
    aiScore: 92,
    owner: "Marcos Silva",
    budget: 12500,
  },
  {
    id: "lead-2",
    name: "Diego Santos",
    company: "Pixel Studio",
    email: "diego@pixelstudio.com",
    phone: "+34 622 410 210",
    source: "Referral",
    status: "warm",
    lastContact: "Ayer",
    aiScore: 71,
    owner: "Lucía Ramos",
    budget: 7200,
  },
  {
    id: "lead-3",
    name: "Laura Gómez",
    company: "Retailia",
    email: "laura@retailia.com",
    phone: "+34 699 887 101",
    source: "Web",
    status: "cold",
    lastContact: "Hace 6 días",
    aiScore: 38,
    owner: "Andrés Vera",
    budget: 3400,
  },
  {
    id: "lead-4",
    name: "Martín Pérez",
    company: "LegalPro",
    email: "martin@legalpro.com",
    phone: "+34 644 210 987",
    source: "Web",
    status: "hot",
    lastContact: "Hace 4 horas",
    aiScore: 88,
    owner: "Marcos Silva",
    budget: 17800,
  },
  {
    id: "lead-5",
    name: "Sofía Vega",
    company: "EventsLab",
    email: "sofia@eventslab.io",
    phone: "+34 600 112 233",
    source: "Partner",
    status: "warm",
    lastContact: "Hace 3 días",
    aiScore: 64,
    owner: "Lucía Ramos",
    budget: 6100,
  },
  {
    id: "lead-6",
    name: "Javier Ortiz",
    company: "LogiCraft",
    email: "javier@logicraft.io",
    phone: "+34 655 221 987",
    source: "Outbound",
    status: "cold",
    lastContact: "Hace 9 días",
    aiScore: 29,
    owner: "Andrés Vera",
    budget: 2800,
  },
]

export const TIMELINE: TimelineItem[] = [
  {
    id: "t-1",
    title: "Llamada inicial",
    detail: "Interés alto por automatización de ventas.",
    time: "Hoy · 09:30",
  },
  {
    id: "t-2",
    title: "Email enviado",
    detail: "Se compartió propuesta personalizada.",
    time: "Ayer · 18:10",
  },
  {
    id: "t-3",
    title: "Lead creado",
    detail: "Lead capturado desde campaña Ads.",
    time: "Hace 3 días · 13:45",
  },
]

export const AUTOMATIONS: AutomationItem[] = [
  {
    id: "auto-1",
    name: "Cold → Secuencia email",
    description: "Serie de 4 emails de reactivación.",
    active: true,
  },
  {
    id: "auto-2",
    name: "Hot → Alerta WhatsApp",
    description: "Notifica al equipo comercial en tiempo real.",
    active: true,
  },
  {
    id: "auto-3",
    name: "Sin respuesta → Tarea",
    description: "Crea seguimiento automático a los 3 días.",
    active: false,
  },
]
