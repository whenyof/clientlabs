import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Compras
        </h1>
        <p className="text-sm text-white/60 max-w-xl">
          Módulo de compras y gastos recurrentes. Aquí verás proveedores, facturas por pagar y el
          calendario de pagos cuando se active este módulo.
        </p>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-300 text-lg">
            ₍₍ (ง˘ω˘)ว ⁾⁾
          </span>
          <h2 className="text-sm font-semibold text-white">
            Aún no hay módulo de Compras conectado
          </h2>
          <p className="text-xs text-white/50 max-w-sm">
            Cuando conectes tus proveedores o registres gastos de proveedor, aquí aparecerán tus
            órdenes de compra, estados de pago (pagado / pendiente) y próximas fechas de vencimiento.
          </p>
        </div>
      </section>
    </div>
  )
}

