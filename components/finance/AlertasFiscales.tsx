"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

function proximoTrimestre(): { nombre: string; limite: Date } {
  const hoy = new Date()
  const mes = hoy.getMonth()
  const año = hoy.getFullYear()

  if (mes < 3) return { nombre: "1T", limite: new Date(año, 3, 20) }
  if (mes < 6) return { nombre: "2T", limite: new Date(año, 6, 20) }
  if (mes < 9) return { nombre: "3T", limite: new Date(año, 9, 20) }
  return { nombre: "4T", limite: new Date(año + 1, 0, 30) }
}

type Alerta = {
  color: "red" | "amber" | "orange"
  titulo: string
  desc: string
  href: string
  cta: string
}

export function AlertasFiscales({
  facturasVencidas = 0,
  totalVencido = 0,
  gastosAnomalos = 0,
}: {
  facturasVencidas?: number
  totalVencido?: number
  gastosAnomalos?: number
}) {
  const trimestre = proximoTrimestre()
  const diasRestantes = Math.ceil(
    (trimestre.limite.getTime() - Date.now()) / 86400000
  )

  const alertas: Alerta[] = []

  if (diasRestantes > 0 && diasRestantes <= 30) {
    alertas.push({
      color: diasRestantes <= 15 ? "red" : "amber",
      titulo: `${diasRestantes} dias para presentar el ${trimestre.nombre}`,
      desc: "Revisa facturas y gastos para calcular Modelo 303 y 130",
      href: "/dashboard/finance/trimestral",
      cta: "Ver resumen",
    })
  }

  if (facturasVencidas > 0) {
    alertas.push({
      color: "red",
      titulo: `${facturasVencidas} ${facturasVencidas === 1 ? "factura vencida" : "facturas vencidas"} sin cobrar`,
      desc: `Total pendiente: ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalVencido)}`,
      href: "/dashboard/finance/facturas?estado=OVERDUE",
      cta: "Ver facturas",
    })
  }

  if (gastosAnomalos > 0) {
    alertas.push({
      color: "orange",
      titulo: `${gastosAnomalos} ${gastosAnomalos === 1 ? "gasto sin clasificar" : "gastos sin clasificar"}`,
      desc: "Clasifica su deducibilidad antes del cierre trimestral",
      href: "/dashboard/finance/gastos",
      cta: "Revisar",
    })
  }

  if (alertas.length === 0) return null

  return (
    <div className="space-y-2 mb-5">
      {alertas.map((alerta, i) => {
        const colorMap = {
          red: {
            wrapper: "bg-red-50 border-red-200",
            icon: "text-red-500",
            title: "text-red-700",
            desc: "text-red-500",
            cta: "text-red-600",
          },
          amber: {
            wrapper: "bg-amber-50 border-amber-200",
            icon: "text-amber-500",
            title: "text-amber-700",
            desc: "text-amber-500",
            cta: "text-amber-600",
          },
          orange: {
            wrapper: "bg-orange-50 border-orange-200",
            icon: "text-orange-500",
            title: "text-orange-700",
            desc: "text-orange-500",
            cta: "text-orange-600",
          },
        }[alerta.color]

        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between p-3.5 rounded-xl border",
              colorMap.wrapper
            )}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn("h-4 w-4 shrink-0", colorMap.icon)} />
              <div>
                <p className={cn("text-[13px] font-semibold leading-none mb-0.5", colorMap.title)}>
                  {alerta.titulo}
                </p>
                <p className={cn("text-[11px]", colorMap.desc)}>{alerta.desc}</p>
              </div>
            </div>
            <Link
              href={alerta.href}
              className={cn("text-[12px] font-medium whitespace-nowrap hover:underline ml-4", colorMap.cta)}
            >
              {alerta.cta} &rarr;
            </Link>
          </div>
        )
      })}
    </div>
  )
}
