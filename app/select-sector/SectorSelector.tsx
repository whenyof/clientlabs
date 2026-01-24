"use client"

import { useRouter } from "next/navigation"
import {
  Utensils,
  Dumbbell,
  Wrench,
  Building2,
  Store,
  Truck,
  Calendar,
  Sparkles,
} from "lucide-react"

type Sector = {
  id: string
  name: string
  description: string
}

const ICONS: Record<string, any> = {
  restaurante: Utensils,
  gimnasio: Dumbbell,
  taller: Wrench,
  inmobiliaria: Building2,
  tienda: Store,
  servicios: Truck,
  eventos: Calendar,
  other: Sparkles,
}

export default function SectorSelector({
  sectors,
}: {
  sectors: readonly Sector[]
}) {
  const router = useRouter()

  // "other" siempre el último
  const normal = sectors.filter((s) => s.id !== "other")
  const other = sectors.find((s) => s.id === "other")
  const ordered = other ? [...normal, other] : normal

  const selectSector = async (sector: string) => {
    try {
      const response = await fetch("/api/onboarding/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector }),
      })

      const data = await response.json()

      if (data.success) {
        // ✅ ONBOARDING COMPLETED - REDIRECT TO DASHBOARD
        router.push(data.redirect)
      } else {
        console.error("Error completing onboarding:", data.error)
        // Handle error (could show toast notification)
      }
    } catch (error) {
      console.error("Error selecting sector:", error)
      // Handle error (could show toast notification)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b12] via-[#0f172a] to-black flex items-center justify-center px-6">
      <div className="max-w-6xl w-full">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            ¿Qué tipo de negocio tienes?
          </h1>

          <p className="text-white/60 text-lg">
            Selecciona tu sector para personalizar tu dashboard
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ordered.map((sector) => {
            const Icon = ICONS[sector.id] ?? Sparkles

            return (
              <button
                key={sector.id}
                onClick={() => selectSector(sector.id)}
                className="
                  group relative p-7 rounded-2xl
                  bg-white/5 backdrop-blur-xl
                  border border-white/10
                  hover:border-indigo-500/50
                  transition-all duration-300
                  hover:scale-[1.04]
                  hover:shadow-2xl hover:shadow-indigo-500/20
                "
              >
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div
                    className="
                      w-14 h-14 flex items-center justify-center
                      rounded-xl
                      bg-indigo-500/10
                      group-hover:bg-indigo-500/20
                      transition
                    "
                  >
                    <Icon className="w-7 h-7 text-indigo-400" />
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {sector.name}
                  </h3>

                  <p className="text-sm text-white/60">
                    {sector.description}
                  </p>
                </div>

                {/* Glow */}
                <div
                  className="
                    absolute inset-0 rounded-2xl
                    opacity-0 group-hover:opacity-100
                    transition
                    bg-gradient-to-br
                    from-indigo-500/10
                    to-fuchsia-500/10
                    blur-xl
                  "
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}