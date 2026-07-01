import Link from "next/link"
import { FACTURACION_DISPONIBLE, FACTURACION_AVISO } from "@/lib/feature-flags"

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!FACTURACION_DISPONIBLE) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Próximamente
          </p>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">
            {FACTURACION_AVISO}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Estamos terminando de pulir esta sección. Vuelve el 5 de julio para
            empezar a facturar.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1b9569]"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
