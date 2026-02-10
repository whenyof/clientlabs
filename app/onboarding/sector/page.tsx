import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

export default async function OnboardingSectorPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  })

  if (!dbUser) {
    redirect("/auth?error=user_missing")
  }

  if (dbUser.onboardingCompleted) {
    redirect("/dashboard")
  }

  return <SectorSelector sectors={SECTORS} />
}
