import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { ProjectsClient } from "./ProjectsClient"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  return (
    <DashboardContainer>
      <ProjectsClient />
    </DashboardContainer>
  )
}
