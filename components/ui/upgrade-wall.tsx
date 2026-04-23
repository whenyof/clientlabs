"use client"

import Link from "next/link"
import { Lock } from "lucide-react"

interface UpgradeWallProps {
  feature: string
  requiredPlan: "Pro" | "Business"
  children?: React.ReactNode
}

export function UpgradeWall({ feature, requiredPlan, children }: UpgradeWallProps) {
  return (
    <div className="relative min-h-[300px]">
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl p-8 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Función disponible en {requiredPlan}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {feature} está disponible a partir del plan {requiredPlan}.
          Actualiza tu plan para desbloquear esta función.
        </p>
        <Link
          href="/precios"
          className="inline-flex items-center gap-2 rounded-full bg-[#1FA97A] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#178f68] transition-colors"
        >
          Ver planes y precios
        </Link>
      </div>
    </div>
  )
}
