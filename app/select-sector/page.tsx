import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
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

async function checkExistingSector() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { sector: true },
  })

  if (profile?.sector) {
    redirect(`/dashboard/${profile.sector}`)
  }
}

export default async function SelectSectorPage() {
  await checkExistingSector()

  return <SectorSelector sectors={SECTORS} />
}