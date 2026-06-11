import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ReportingView } from "@/modules/reporting/components/ReportingView"
import { getSectorConfigByPath } from "@/config/sectors"

export default async function ReportingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const config = getSectorConfigByPath("/dashboard/reporting")
  const reportingEnabled = config.features?.modules?.reporting ?? true

  if (!reportingEnabled) {
    redirect("/dashboard")
  }

  return <ReportingView />
}
