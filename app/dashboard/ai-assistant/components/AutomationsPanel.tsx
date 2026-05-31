"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { SparklesIcon, CheckCircleIcon, PauseCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

type Automation = {
  id: string
  name: string
  isActive: boolean
  totalExecutions: number
  lastExecution: { executedAt: string; status: string } | null
}

type AutomationsResponse = { data: Automation[] }

export function AutomationsPanel() {
  const { data, isLoading } = useQuery<AutomationsResponse>({
    queryKey: ["automations"],
    queryFn: () => fetch("/api/automations").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  const automations = data?.data ?? []
  const active = automations.filter(a => a.isActive).length
  const totalExecutions = automations.reduce((s, a) => s + a.totalExecutions, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Automatizaciones</h3>
          <p className="text-[var(--text-secondary)]">Flujos activos en tu negocio</p>
        </div>
        <Link
          href="/dashboard/automatizaciones"
          className="px-4 py-2 text-sm font-medium bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Gestionar
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {isLoading ? "…" : active}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Activas</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-slate-500/10 to-gray-600/10 border border-slate-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {isLoading ? "…" : automations.length - active}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Pausadas</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {isLoading ? "…" : totalExecutions}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Ejecuciones</div>
        </motion.div>
        <motion.div className="bg-gradient-to-br from-orange-500/10 to-amber-600/10 border border-orange-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {isLoading ? "…" : automations.length}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Total</div>
        </motion.div>
      </div>

      {!isLoading && automations.length === 0 ? (
        <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-12 text-center">
          <SparklesIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">Sin automatizaciones activas</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Crea automatizaciones desde la sección de Automatizaciones para verlas aquí.
          </p>
          <Link
            href="/dashboard/automatizaciones"
            className="inline-block mt-4 px-5 py-2 bg-[#0F766E] text-white text-sm font-semibold rounded-lg hover:bg-[#0E665F] transition-colors"
          >
            Crear automatización
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
          {automations.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {a.isActive ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400 shrink-0" />
                ) : (
                  <PauseCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{a.name}</p>
                  {a.lastExecution && (
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Última ejecución: {new Date(a.lastExecution.executedAt).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  a.isActive ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"
                }`}>
                  {a.isActive ? "Activa" : "Pausada"}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{a.totalExecutions} ejecuciones</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
