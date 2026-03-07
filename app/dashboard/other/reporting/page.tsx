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

  const config = getSectorConfigByPath("/dashboard/other/reporting")
  const { labels, features } = config
  const reportingLabels = labels.reporting
  const reportingEnabled = features?.modules?.reporting ?? true

  if (!reportingEnabled) {
    redirect("/dashboard/other")
  }

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white tracking-tight truncate">
          {reportingLabels.title}
        </h1>
        <p className="text-sm text-white/60 mt-0.5 truncate max-w-xl">
          {reportingLabels.pageSubtitle}
        </p>
      </div>

      <ReportingView />
    </div>
  )
}
