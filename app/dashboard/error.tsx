"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-[var(--text-primary)] font-semibold">Algo salió mal</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {error.message || "Se ha producido un error inesperado"}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-[#1FA97A] text-white rounded-lg hover:bg-[#178f68] transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
