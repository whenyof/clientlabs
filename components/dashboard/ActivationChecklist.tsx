"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Users, Target, FileText, Building2, Zap, Check, ChevronRight } from "lucide-react"

const STEPS = [
  { key: "addedClient",       label: "Añade tu primer cliente",          description: "Tarda 1 minuto",                    href: "/dashboard/clients",                      Icon: Users },
  { key: "addedLead",         label: "Crea tu primer lead",              description: "Registra una oportunidad",           href: "/dashboard/leads",                        Icon: Target },
  { key: "createdInvoice",    label: "Genera tu primera factura",        description: "Mira cómo queda el PDF",            href: "/dashboard/finance/invoicing",             Icon: FileText },
  { key: "configuredTax",     label: "Configura tus datos fiscales",     description: "NIF, dirección, IBAN",               href: "/dashboard/settings?section=company",     Icon: Building2 },
  { key: "createdAutomation", label: "Activa tu primera automatización", description: "Que ClientLabs trabaje por ti",      href: "/dashboard/automations",                  Icon: Zap },
] as const

type ChecklistData = {
  checklist: Record<string, boolean>
  onboardingCompleted: boolean
}

export function ActivationChecklist() {
  const { data, isLoading } = useQuery<ChecklistData>({
    queryKey: ["activation-checklist"],
    queryFn: () => fetch("/api/onboarding/checklist").then((r) => r.json()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 60_000,
  })

  if (isLoading || !data || data.onboardingCompleted) return null

  const checklist = data.checklist
  const completed = STEPS.filter((s) => checklist[s.key]).length
  const allDone = completed === STEPS.length

  if (allDone) return null

  const percent = (completed / STEPS.length) * 100

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Primeros pasos</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Completa los 5 pasos para sacarle el máximo partido</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-emerald-600">{completed}/5</span>
          <p className="text-[10px] text-slate-400">completados</p>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {STEPS.map((step) => {
          const done = Boolean(checklist[step.key])
          const { Icon } = step
          return (
            <Link
              key={step.key}
              href={done ? "#" : step.href}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                done ? "opacity-60 cursor-default" : "hover:bg-white"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  done ? "bg-emerald-500" : "bg-slate-100"
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    done ? "text-emerald-700 line-through" : "text-slate-900"
                  )}
                >
                  {step.label}
                </span>
                <p className="text-[11px] text-slate-400">{step.description}</p>
              </div>
              {!done && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
            </Link>
          )
        })}
      </div>

      {completed > 0 && (
        <p className="text-[11px] text-emerald-600 text-center mt-3">
          Vas genial — faltan {5 - completed} pasos para completar la configuración.
        </p>
      )}
    </div>
  )
}
