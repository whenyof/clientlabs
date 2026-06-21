import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { ProjectDetailClient } from "./ProjectDetailClient"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")
  const { id } = await params
  return (
    <DashboardContainer>
      <ProjectDetailClient projectId={id} />
    </DashboardContainer>
  )
}
