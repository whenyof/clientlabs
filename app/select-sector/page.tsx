import { redirect } from "next/navigation"
import { requireAuthenticatedUser } from "@/lib/auth-guards"
import SectorSelector from "./SectorSelector"

const SECTORS = [
  { id: "restaurante", name: "Restaurante", description: "Restaurante y gastronomía" },
  { id: "gimnasio", name: "Gimnasio", description: "Centro deportivo y fitness" },
  { id: "taller", name: "Taller", description: "Taller mecánico" },
  { id: "inmobiliaria", name: "Inmobiliaria", description: "Agencia inmobiliaria" },
  { id: "tienda", name: "Tienda", description: "Tienda física y retail" },
  { id: "servicios", name: "Servicios", description: "Servicios a domicilio" },
  { id: "eventos", name: "Eventos", description: "Organización de eventos" },
  { id: "other", name: "Otro", description: "Dashboard genérico" },
] as const

export default async function SelectSectorPage() {
  // ✅ REQUIRE AUTHENTICATED USER
  const { session, dbUser } = await requireAuthenticatedUser()

  // ✅ IF ALREADY COMPLETED ONBOARDING, SKIP TO DASHBOARD
  if (dbUser.onboardingCompleted) {
    redirect("/dashboard/other")
  }

  return <SectorSelector sectors={SECTORS} />
}