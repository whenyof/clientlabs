"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  LayoutDashboard, Target, Users, CheckSquare,
  DollarSign, Zap, Megaphone, Settings,
} from "lucide-react"

// ─── Tour steps ──────────────────────────────────────────────────────────────
export const TOUR_STEPS = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Panel de control",
    subtitle: "Tu base de operaciones",
    description:
      "Aquí tienes una vista completa de tu negocio: KPIs clave, actividad reciente, métricas de leads y clientes, y acceso rápido a todo lo demás.",
    tips: ["Revisa tus métricas cada mañana", "Los widgets se actualizan en tiempo real"],
  },
  {
    id: "leads",
    href: "/dashboard/leads",
    icon: Target,
    title: "Leads",
    subtitle: "Captura prospectos",
    description:
      "Gestiona tus contactos potenciales. Añádelos manualmente, importa una lista CSV o captura leads al instante con el formulario de scan QR en eventos.",
    tips: ["Usa el botón + para añadir leads rápido", "El pipeline muestra el estado de cada lead"],
  },
  {
    id: "clients",
    href: "/dashboard/clients",
    icon: Users,
    title: "Clientes",
    subtitle: "Base de datos de clientes",
    description:
      "Todos tus clientes activos en un lugar. Accede al historial de comunicaciones, documentos, presupuestos y facturas de cada cliente.",
    tips: ["Convierte un lead a cliente con un clic", "Filtra por sector, estado o fecha"],
  },
  {
    id: "tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    title: "Tareas",
    subtitle: "Organiza tu trabajo",
    description:
      "Crea tareas, asigna fechas límite y prioridades. Las tareas urgentes aparecen destacadas en el sidebar con un contador rojo.",
    tips: ["Marca tareas urgentes con alta prioridad", "Asigna tareas a miembros de tu equipo"],
  },
  {
    id: "finance",
    href: "/dashboard/finance",
    icon: DollarSign,
    title: "Finanzas",
    subtitle: "Control financiero completo",
    description:
      "Crea presupuestos, facturas y hojas de pedido. Realiza un seguimiento de ingresos, gastos y estado de cobros de un vistazo.",
    tips: ["Convierte presupuestos en facturas con un clic", "Exporta facturas en PDF listo para enviar"],
  },
  {
    id: "automatizaciones",
    href: "/dashboard/automatizaciones",
    icon: Zap,
    title: "Automatizaciones",
    subtitle: "Trabaja más inteligente",
    description:
      "Crea reglas automáticas que actúan cuando ocurren eventos: lead nuevo → envía email, tarea vencida → notificación, y más.",
    tips: ["Empieza con las plantillas predefinidas", "Cada automatización te ahorra horas a la semana"],
  },
  {
    id: "marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
    title: "Marketing",
    subtitle: "Llega a tus clientes",
    description:
      "Crea y envía campañas de email marketing a tus listas. Segmenta por comportamiento, sector o estado del lead.",
    tips: ["Importa tus listas de contactos", "Usa plantillas diseñadas para convertir"],
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    title: "Ajustes",
    subtitle: "Personaliza tu cuenta",
    description:
      "Configura tu perfil, los datos de tu empresa, tu equipo y las integraciones. Todo lo que necesitas para que ClientLabs sea tuyo.",
    tips: ["Añade el logo y colores de tu empresa", "Invita a tu equipo desde aquí"],
  },
]

// ─── Context types ────────────────────────────────────────────────────────────
type TourContextValue = {
  active: boolean
  step: number
  total: number
  currentStep: typeof TOUR_STEPS[0]
  start: () => void
  stop: () => void
  goTo: (n: number) => void
  next: () => void
  prev: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function TourProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const [step, setStep]     = useState(0)

  // Read from localStorage on mount
  useEffect(() => {
    const isActive = localStorage.getItem("cl-tour-active") === "1"
    const savedStep = parseInt(localStorage.getItem("cl-tour-step") ?? "0", 10)
    if (isActive) {
      setActive(true)
      setStep(isNaN(savedStep) ? 0 : Math.min(savedStep, TOUR_STEPS.length - 1))
    }
  }, [])

  const persist = useCallback((a: boolean, s: number) => {
    if (a) {
      localStorage.setItem("cl-tour-active", "1")
      localStorage.setItem("cl-tour-step", String(s))
    } else {
      localStorage.removeItem("cl-tour-active")
      localStorage.removeItem("cl-tour-step")
    }
  }, [])

  const start = useCallback(() => {
    setActive(true)
    setStep(0)
    persist(true, 0)
  }, [persist])

  const stop = useCallback(() => {
    setActive(false)
    persist(false, 0)
  }, [persist])

  const goTo = useCallback((n: number) => {
    const s = Math.max(0, Math.min(n, TOUR_STEPS.length - 1))
    setStep(s)
    persist(true, s)
  }, [persist])

  const next = useCallback(() => {
    setStep(s => {
      const ns = s + 1
      if (ns >= TOUR_STEPS.length) {
        setActive(false)
        persist(false, 0)
        return s
      }
      persist(true, ns)
      return ns
    })
  }, [persist])

  const prev = useCallback(() => {
    setStep(s => {
      const ns = Math.max(0, s - 1)
      persist(true, ns)
      return ns
    })
  }, [persist])

  return (
    <TourContext.Provider value={{
      active, step,
      total: TOUR_STEPS.length,
      currentStep: TOUR_STEPS[step],
      start, stop, goTo, next, prev,
    }}>
      {children}
    </TourContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error("useTour must be used inside TourProvider")
  return ctx
}
